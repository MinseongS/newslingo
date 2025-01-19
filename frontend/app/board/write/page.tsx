import WritePageClient from "./WritePageClient";

export default async function WritePage({
    searchParams,
}: {
    searchParams: Promise<{ page?: string; category?: string }>;
}) {
    const params = await searchParams;
    const category = params.category || "free"; // 서버에서 처리

    return <WritePageClient category={category} />;
}