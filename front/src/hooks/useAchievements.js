import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../api/api.js';

export const useAchievements = () => {
    const queryClient = useQueryClient();

    /**
     * Obtiene el listado completo de cartas.
     */
    const { data: achievements, isLoading, error } = useQuery({
        queryKey: ['logros'],
        queryFn: async () => {
            const { data } = await api.get('/logros');
            return data;
        },
        staleTime: 300000,
    });

    /**
     * Obtiene la info de una carta mediante su `id`
     * @param {number|string} id 
     */
    const getAchievements = async (id) => {
        try {
            const { data } = await api.get(`/logros/${id}`);
            return data;
        } catch (error) {
            console.error("Error al obtener el logro:", error.response?.data?.message);
            throw error;
        }
    };

    const newAchievement = useMutation({
        mutationFn: async (dataToSend) => {
            const { data } = await api.post(`/nuevo-logro`, dataToSend);
            return data;
        },
        onSuccess: (data) => {
            console.log(data)
            queryClient.invalidateQueries({ queryKey: ['authUser'] });
            queryClient.setQueryData(['authUser'], data.usuario);
        }
    });

    return {
        achievements,
        isLoading,
        error,
        getAchievements,
        newAchievement: async (dataToSend) => {
            const data = await newAchievement.mutateAsync(dataToSend);
            return data.obtenido === true;
        },
    };
};