import { Card, CardBody, CardFooter, CardHeader } from "@/app/components/card";
import { User } from "lucide-react";
import { useState } from "react";
import { LinkedAccountModal } from "./link-account-modal";
import { LinkedAccountItem } from "./linked-account-item";
import { LinkedAccount } from "./types";


export function LinkedAccounts({ accounts: propAccounts }: { accounts: LinkedAccount[] }) {
    const [accounts] = useState<LinkedAccount[]>(propAccounts ?? []);
    return (
        <>
            <Card className="bg-dark border border-wood-100">
                <CardHeader className="px-4 py-3 border-b border-wood-100">
                    <div className="flex items-center gap-2">
                        <User className="text-primary" />
                        <h2 className="text-primary font-semibold">Linked accounts</h2>
                    </div>
                </CardHeader>
                <CardBody className="px-4 py-2">
                    <div className="space-y-1">
                        {accounts.map((account) => (
                            <LinkedAccountItem
                                key={`${account.id}`}
                                account={account}
                            />
                        ))}
                    </div>
                </CardBody>
                <CardFooter className="px-4 py-3 border-t border-wood-100">
                    <LinkedAccountModal />
                </CardFooter>
            </Card>

        </>
    )
}