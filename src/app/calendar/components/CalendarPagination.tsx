'use client';
import { Pagination } from "@heroui/react";
import { useRouter } from "next/navigation";

export default function CalendarPagination({ totalPages, currentPage }: {
    totalPages: number;
    currentPage: number;
}) {
    const router = useRouter();
    return (
        <Pagination
            showControls
            initialPage={currentPage}
            page={currentPage}
            total={totalPages}
            onChange={(page) => {
                if (page !== currentPage) {
                    router.push(`/calendar?p=${page}`);
                }
            }}
            classNames={{
                cursor: "!bg-gold !text-dark shadow-lg !border-gold-100 transition-colors duration-200",
                item: "!bg-dark text-default border border-dark-100 hover:!bg-moss hover:!border-moss-100 transition-colors duration-200",
                prev: "!bg-dark text-default border border-dark-100 hover:!bg-moss hover:!border-moss-100 transition-colors duration-200",
                next: "!bg-dark text-default border border-dark-100 hover:!bg-moss hover:!border-moss-100 transition-colors duration-200"
            }}
        />
    )
}