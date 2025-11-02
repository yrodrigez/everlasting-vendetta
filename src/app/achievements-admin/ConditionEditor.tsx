'use client'
import { Input } from "@heroui/react";
import Editor from '@monaco-editor/react';
import { editor } from "monaco-editor";
import { useEffect, useMemo, useState } from "react";
import { Button } from "@/app/components/Button";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFlask } from "@fortawesome/free-solid-svg-icons";
import { useMessageBox } from "@utils/msgBox";
import { useAuth } from "@context/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { executeCondition } from "@hooks/useAchievements";
import { AchievementCondition } from "@/app/types/Achievements";
import { useShallow } from "zustand/react/shallow";
import { useCharacterStore } from "../components/characterStore";
import { createClientComponentClient } from "../util/supabase/createClientComponentClient";

function ConditionTestWindow({ condition }: { condition: AchievementCondition }) {
	const { accessToken } = useAuth();
	const supabase = useMemo(() => createClientComponentClient(accessToken), [accessToken]);

	const selectedCharacter = useCharacterStore(useShallow(state => state.selectedCharacter));
	const { data } = useQuery({
		queryKey: ['testCondition', selectedCharacter?.id],
		queryFn: async () => {
			if (!selectedCharacter || !condition || !supabase) return { count: 0, result: [] }
			// @ts-ignore
			const { data, error } = await executeCondition(supabase, condition, selectedCharacter)
			return error || { count: data.length, result: data }
		}
	})
	return (
		<div className="
			w-full h-full
			flex flex-col
			overflow-auto scrollbar-pill
			min-h-[90vh]
		">
			<Editor
				className={'w-full h-full min-h-[90vh]'}
				defaultLanguage="json"
				language="json"
				theme="vs-dark"
				defaultValue={JSON.stringify(data, null, 2)}
				value={JSON.stringify(data, null, 2)}
				options={{
					minimap: { enabled: false },
					scrollBeyondLastLine: false,
					readOnly: true,
				}}
			/>
		</div>
	)
}

export function ConditionEditor({ code, name }: { code?: string, name: string }) {
	function handleEditorChange(value?: string, event?: editor.IModelContentChangedEvent) {
		setEditorValue(value || '')
		setInputValue(value || '')
		console.log(value)
	}

	const [editorValue, setEditorValue] = useState(code ?? '')
	const [inputValue, setInputValue] = useState(code ?? '')
	useEffect(() => {
		setEditorValue(code ?? '')
		setInputValue(code ?? '')
	}, [code])

	const { alert } = useMessageBox()

	return (
		<div className="w-full h-full flex gap-1">
			<div
				className="w-full h-full flex flex-col gap-4"
			>
				<Input
					type="hidden"
					name={name}
					value={inputValue}
					isRequired />
				<Editor
					className={'w-full h-full'}
					defaultLanguage="json"
					language="json"
					theme="vs-dark"
					defaultValue={editorValue}
					value={editorValue}
					options={{
						minimap: { enabled: false },
						scrollBeyondLastLine: false,
					}}
					onChange={handleEditorChange}
				/>
			</div>
			<Button
				size="sm"
				onPress={() => {
					alert({
						message: <ConditionTestWindow condition={JSON.parse(inputValue)} />,
						type: 'window'
					})
				}}
				isIconOnly
			>
				<FontAwesomeIcon icon={faFlask} />
			</Button>
		</div>
	)
}
