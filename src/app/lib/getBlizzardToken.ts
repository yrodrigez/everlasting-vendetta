import axios from "axios";
export const getBlizzardToken = async () => {
    const url: string = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/everlasting-vendetta`
    const jwt: string = `Bearer ` + process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    const response = await axios.get(url, {
        headers: {
            'Authorization': jwt
        }
    })

    return response.data
}
