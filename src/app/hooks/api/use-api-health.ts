import { useQuery } from "@tanstack/react-query";

export function useApiHealth() {
    const apiUrl = process.env.NEXT_PUBLIC_EV_API_URL;

    const { data, error, refetch, isFetching } = useQuery({
        queryKey: ['apiHealth'],
        queryFn: async () => {
            try {
                const response = await fetch(`${apiUrl}/health`);
                if (!response.ok) {
                    const text = await response.text();
                    console.error('API health check failed with status:', response.status, 'and message:', text);
                }
                return response.ok;
            }
            catch (error) {
                return false;
            }
        },
        refetchInterval: (query) => {
            // Si hay error o data es false, refetch más seguido
            const isHealthy = query.state.data ?? true;
            return isHealthy ? 60000 : 10000;
        },
        refetchOnWindowFocus: true,
        refetchOnReconnect: true,
    });

    // Derivar el estado de isHealthy directamente de data y error
    const isHealthy = error ? false : (data ?? true);

    return {
        recheck: refetch,
        isHealthy,
        apiUrl,
        isChecking: isFetching,
    }
}