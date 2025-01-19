import { NextRequest } from "next/server";

export async function GET(req: NextRequest) {
    try {
        const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
        const response = await fetch(`${baseUrl}/api/news_id`);
        const ids = await response.json();

        const sitemap = `
            <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
                <url>
                    <loc>https://newslingo.site</loc>
                    <changefreq>daily</changefreq>
                    <priority>1.0</priority>
                </url>
                ${ids
                .map(
                    (id: string) => `
                <url>
                    <loc>https://newslingo.site/news/${id}</loc>
                    <changefreq>daily</changefreq>
                    <priority>0.8</priority>
                </url>
                `
                )
                .join("")}
            </urlset>
        `;

        return new Response(sitemap, {
            headers: { "Content-Type": "application/xml" },
        });
    } catch (error) {
        console.error("Failed to generate sitemap:", error);
        return new Response("Internal Server Error", { status: 500 });
    }
}