import { useQuery } from '@tanstack/react-query';
import api from '../api/api.js';

/**
 * Hook para gestionar los modificadores disponibles en el juego.
 * Al ser un endpoint público, no requiere autenticación.
 */
export const useModifier = () => {
    
    const { data: modifiers, isLoading, error } = useQuery({
        queryKey: ['modifiers'],
        queryFn: async () => {
            const { data } = await api.get('/modificadores');
            return data;
        },
        staleTime: 600000, 
    });

    /**
     * Solicita la información de un modificador específico.
     * @param {number|string} id 
     */
    const getModificadorById = async (id) => {
        try {
            const { data } = await api.get(`/modificadores/${id}`);
            return data;
        } catch (error) {
            console.error("Error al obtener el modificador:", error.response?.data?.message);
            throw error;
        }
    };

    return {
        modifiers,
        isLoading,
        error,
        getModificadorById
    };
};