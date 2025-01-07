import {NextRequest, NextResponse} from "next/server";


export async function GET(request: NextRequest, context: any) {
	const params = await context.params;
	const name = (params?.name ?? '').toLowerCase();

	const url = new URL(request.url)
	const force = url.searchParams.get('force') === 'true'
	const functionUrl = `https://ijzwizzfjawlixolcuia.supabase.co/functions/v1/gearscore${force ? '?force=true' : ''}`
	const response = await fetch(functionUrl, {
		method: 'POST',
		headers: {
			'Authorization': 'Bearer ' + process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
		},
		body: JSON.stringify([name])
	})

	if (!response.ok) {
		console.error('Error fetching gear score:', response.status, response.statusText)
		return NextResponse.json({gs: 0, color: 'common'})
	}

    const data = await response.json()
    return NextResponse.json(data[0])
}
