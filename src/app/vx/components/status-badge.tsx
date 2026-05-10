import type { PredictionMarketDetails } from "@/lib/api";
import { getStatusClass } from "./vx-exchange.utils";

export function StatusBadge({ status, outcome }: { status: PredictionMarketDetails["status"]; outcome?: string }) {
    return <span className={`rounded-full border px-2 py-1 text-[10px] font-black tracking-[0.14em] ${getStatusClass(status)}`}>{status}{outcome ? `: ${outcome}` : ""}</span>;
}
