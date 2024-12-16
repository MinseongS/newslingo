import NextAuth, { NextAuthOptions, Account, Profile, Session, User } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import prisma from "@/lib/prisma";
import { JWT } from "next-auth/jwt";
import logger from "@/lib/logger";
import { getCurrentKSTTime } from "@/utils/utils";

const authOptions: NextAuthOptions = {
    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID || "",
            clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
        }),
    ],
    session: {
        strategy: "jwt",
        maxAge: 24 * 60 * 60, // 1일
    },
    callbacks: {
        /**
         * signIn: 구글 OAuth 인증 성공 시 DB에 사용자/토큰 정보 저장 혹은 갱신
         */
        async signIn({ user, account, profile }: { user: User; account: Account | null; profile?: Profile }): Promise<boolean> {
            if (!account || !profile) return false;

            const providerId = profile.sub || "";
            const email = user.email;
            const name = user.name;
            const picture = user.image;
            const accessToken = account.access_token || "";
            const refreshToken = account.refresh_token;
            const expiresAt = account.expires_at ? new Date(account.expires_at * 1000) : null;

            const existingAccount = await prisma.o_auth_account.findUnique({
                where: { providerId },
                include: { user: true },
            });

            const currentTime = new Date().toISOString();
            if (!existingAccount) {
                logger.info(`[${getCurrentKSTTime()}] ${user.name} ${user.email} create user`);
                await prisma.user.create({
                    data: {
                        providerId,
                        email,
                        name,
                        profilePicture: picture,
                        oauthAccount: {
                            create: {
                                provider: "google",
                                providerId,
                                accessToken,
                                refreshToken,
                                expiresAt: expiresAt || new Date(),
                                tokenType: account.token_type || "",
                                scope: account.scope || "",
                            },
                        },
                    },
                });
            } else {
                await prisma.o_auth_account.update({
                    where: { id: existingAccount.id },
                    data: {
                        accessToken,
                        refreshToken: refreshToken || existingAccount.refreshToken,
                        expiresAt: expiresAt || existingAccount.expiresAt,
                        scope: account.scope || existingAccount.scope,
                    },
                });

                if (existingAccount.user) {
                    await prisma.user.update({
                        where: { id: existingAccount.user.id },
                        data: {
                            email,
                            name,
                            profilePicture: picture,
                        },
                    });
                }
            }
            logger.info(`[${getCurrentKSTTime()}] ${user.name} ${user.email} signIn user`);

            return true;
        },

        async jwt({ token, user }: { token: JWT; user?: User }): Promise<JWT> {
            const now = Math.floor(Date.now() / 1000);

            if (user) {
                // Prisma를 통해 사용자 ID 가져오기
                const existingUser = await prisma.user.findUnique({
                    where: { email: user.email || "" },
                    select: { id: true },
                });

                if (existingUser) {
                    token.id = existingUser.id; // 사용자 ID를 JWT에 저장
                }

                // 로그인 시 토큰 초기화
                token.iat = now;
                token.exp = now + 24 * 60 * 60; // 1일 만료
                token.lastRefresh = now;
            }

            // 30분마다 토큰 갱신
            if (token.lastRefresh && now - (token.lastRefresh as number) > 30 * 60) {
                token.lastRefresh = now;
                token.exp = now + 24 * 60 * 60;
            }

            return token;
        },

        async session({ session, token }: { session: Session; token: JWT }): Promise<Session> {
            // JWT 토큰 데이터를 세션에 추가
            session.user = {
                ...session.user,
                id: token.id as string, // JWT에 저장된 사용자 ID를 세션에 추가
            };
            session.expires = new Date((token.exp! as number) * 1000).toISOString();
            return session;
        },
    },
};

export const POST = NextAuth(authOptions);
export const GET = NextAuth(authOptions);