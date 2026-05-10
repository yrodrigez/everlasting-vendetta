import { Button } from "@/components/Button";
import { Input } from "@/components/input";
import { Select } from "@/components/select";
import { Textarea } from "@/components/text-area";
import { TimeInput } from "@/components/time-input";
import type { CreatePredictionMarketInput, PredictionMarketType } from "@/lib/api";
import { DatePicker, SelectItem } from "@heroui/react";
import { CalendarDate, getLocalTimeZone, today, Time } from "@internationalized/date";
import { type FormEvent, useState } from "react";
import { toast } from "sonner";

export function CreateMarketForm({
    onCreate,
    isPending,
}: {
    onCreate: (input: CreatePredictionMarketInput) => Promise<unknown>;
    isPending: boolean;
}) {
    const [type, setType] = useState<PredictionMarketType>("YES_NO");
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [closeDate, setCloseDate] = useState<CalendarDate | null>(today(getLocalTimeZone()));
    const [closeTime, setCloseTime] = useState(new Time(20, 0));
    const [outcomesText, setOutcomesText] = useState("");

    async function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        const trimmedTitle = title.trim();

        if (!trimmedTitle || !closeDate || !closeTime) {
            toast.error("Title and close time are required.");
            return;
        }

        const closesAt = new Date(closeDate.year, closeDate.month - 1, closeDate.day, closeTime.hour, closeTime.minute);

        const payload: CreatePredictionMarketInput = {
            title: trimmedTitle,
            description: description.trim() || null,
            closesAt: closesAt.toISOString(),
            type,
        };

        if (type !== "YES_NO") {
            const outcomes = [...new Set(outcomesText.split(/\r?\n|,/).map((outcome) => outcome.trim()).filter(Boolean))];

            if (outcomes.length < 2) {
                toast.error("Custom markets need at least two outcomes.");
                return;
            }

            payload.outcomes = outcomes;
        }

        await onCreate(payload);
        setTitle("");
        setDescription("");
        setCloseDate(today(getLocalTimeZone()));
        setCloseTime(new Time(20, 0));
        setOutcomesText("");
        setType("YES_NO");
    }

    return (
        <details className="rounded-md border border-gold/25 bg-wood p-4">
            <summary className="cursor-pointer text-sm font-black uppercase tracking-[0.2em] text-gold/80">Create market</summary>
            <form onSubmit={handleSubmit} className="mt-4 grid gap-4 lg:grid-cols-2">
                <Input label="Title" value={title} onValueChange={setTitle} placeholder="Will we clear the raid?" />
                <div className="grid gap-3 sm:grid-cols-2">
                    <DatePicker
                        label="Close date"
                        value={closeDate as never}
                        minValue={today(getLocalTimeZone())}
                        onChange={(value) => setCloseDate(value as CalendarDate | null)}
                        classNames={{
                            segment: "text-default/60 data-[editable=true]:text-default",
                            inputWrapper: "transition-all duration-200 bg-wood-900 border border-wood-100 text-default hover:border-wood-100 focus:border-wood-100 focus:ring-2 focus:ring-wood-100 hover:bg-wood data-[hover=true]:border-wood-100 focus-within:hover:ring-wood-100 focus-within:hover:bg-wood",
                            label: "text-default/60 group-data-[filled=true]:text-default/60",
                            description: "text-default",
                            popoverContent: "bg-wood-900 border border-wood-100 text-default",
                        }}
                    />
                    <TimeInput label="Close time" hourCycle={24} value={closeTime} onChange={(value) => value && setCloseTime(new Time(value.hour, value.minute))} />
                </div>
                <Textarea label="Description" value={description} onValueChange={setDescription} className="lg:col-span-2" placeholder="Rules, timing, and resolution notes." />
                <Select
                    label="Type"
                    selectedKeys={[type]}
                    onSelectionChange={(keys) => setType(String(Array.from(keys)[0] ?? "YES_NO") as PredictionMarketType)}
                >
                    <SelectItem key="YES_NO">YES / NO</SelectItem>
                    <SelectItem key="MULTIPLE_CHOICE">Multiple choice</SelectItem>
                    <SelectItem key="NUMERIC_RANGE">Numeric range</SelectItem>
                </Select>
                {type !== "YES_NO" ? (
                    <Textarea label="Outcomes, one per line or comma separated" value={outcomesText} onValueChange={setOutcomesText} placeholder="Boss A\nBoss B\nBoss C" />
                ) : null}
                <Button type="submit" isDisabled={isPending} isLoading={isPending} className="border-moss-100 bg-moss px-4 py-3 font-black text-gold hover:bg-moss-100 lg:col-span-2">
                    Create Draft Market
                </Button>
            </form>
        </details>
    );
}
