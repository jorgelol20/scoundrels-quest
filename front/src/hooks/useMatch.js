import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../api/api.js';

export const useMatch = () => {
    const queryClient = useQueryClient();

    const { data: matches, isLoading, error } = useQuery({
        queryKey: ['matches'],
        queryFn: async () => {
            const { data } = await api.get('/partidas');
            return data;
        },
        staleTime: 300000,
    });

    const saveMatch = useMutation({
        mutationFn: async ({ form }) => {
            const { data } = await api.post('/partidas', form);
            // Asegúrate de que tu API devuelve el objeto con el ID aquí
            return data.response || data; 
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['matches'] });
            return true
        },
        onError: () => {
            return false
        }
    });

    const updateMatch = useMutation({
        mutationFn: async ({ matchId, form }) => {
            const { data } = await api.put(`/partidas/${matchId}`, form);
            return data.response || data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['matches'] });
        }
    });

    const getMatchById = async (id) => {
        try {
            const { data } = await api.get(`/partidas/${id}`);
            return data;
        } catch (error) {
            console.error("Error al obtener la partida:", error.response?.data?.message);
            throw error;
        }
    };

    const getRanking = async () => {
        try {
            const response = await api.get(`/ranking-partidas`);
            return response.data;
        } catch (error) {
            console.error("Error al obtener usuario:", error.response?.data?.message);
            throw error;
        }
    };

    return {
        matches,
        isLoading,
        error,
        saveMatch: saveMatch.mutateAsync,
        updateMatch: updateMatch.mutateAsync, 
        isSaving: saveMatch.isPending,
        isUpdating: updateMatch.isPending,
        saveError: saveMatch.error,
        updateError: updateMatch.error,
        getMatchById,
        getRanking
    };
};