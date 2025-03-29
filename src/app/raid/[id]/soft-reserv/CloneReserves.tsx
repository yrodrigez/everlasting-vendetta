import { Tooltip} from "@heroui/react";
import Link from "next/link";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faClone} from "@fortawesome/free-solid-svg-icons";
import {Button} from "@/app/components/Button";

export default function CloneReserves({resetId}: { resetId: string }) {
    return (
        <Tooltip
            content={'Clone reserves'}
            placement={'right'}
        >
            <Link href={`/raid/${resetId}/soft-reserv/clone`}>
                <Button
                    className={'bg-moss text-gold rounded'}
                    size={'lg'}
                    isIconOnly>
                    <FontAwesomeIcon icon={faClone}/>
                </Button>
            </Link>
        </Tooltip>
    )
}