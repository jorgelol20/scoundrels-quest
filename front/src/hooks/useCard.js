import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../api/api.js';

export const useCard = () => {
    const queryClient = useQueryClient();

    /**
     * Obtiene el listado completo de cartas.
     */
    const { data: cards, isLoading, error } = useQuery({
        queryKey: ['cards'],
        queryFn: async () => {
            const { data } = await api.get('/cartas');
            return data;
        },
        staleTime: 300000,
    });

    /**
     * Obtiene la info de una carta mediante su `id`
     * @param {number|string} id 
     */
    const getCard = async (id) => {
        try {
            const { data } = await api.get(`/cartas/${id}`);
            return data;
        } catch (error) {
            console.error("Error al obtener la carta:", error.response?.data?.message);
            throw error;
        }
    };

    return {
        cards,
        isLoading,
        error,
        getCard
    };
};