import { useQuery } from '@tanstack/react-query';
import api from '../api/api.js';

/**
 * Hook para gestionar los personajes.
 */
export const useCharacters = () => {

    /**
     * Obtiene el listado completo de personajes.
     */
    const { data: characters, isLoading, error } = useQuery({
        queryKey: ['characters'],
        queryFn: async () => {
            let { data } = await api.get('/personajes');
            return data;
        },
        staleTime: 300,
    });

    /**
     * Obtiene la info de un personaje mediante su `id`
     * @param {number|string} id 
     */
    const getCharacterById = async (id) => {
        try {
            const { data } = await api.get(`/personajes/${id}`);
            return data;
        } catch (error) {
            console.error("Error al obtener el personaje:", error.response?.data?.message);
            throw error;
        }
    };

    return {
        characters,
        isLoading,
        error,
        getCharacterById
    };
};