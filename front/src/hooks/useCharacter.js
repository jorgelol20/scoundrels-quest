import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import api from '../api/api.js';

/**
 * Hook para gestionar los personajes.
 */
export const useCharacters = () => {
    // Suscribe el hook al idioma: al cambiar re-renderiza, cambia la
    // queryKey y refetchea con el Accept-Language nuevo.
    const { i18n } = useTranslation();

    /**
     * Obtiene el listado completo de personajes.
     * Clave por idioma: al cambiar el locale se refetchea con el
     * Accept-Language nuevo (el back traduce nombre/descripcion).
     */
    const { data: characters, isLoading, error } = useQuery({
        queryKey: ['characters', i18n.language],
        queryFn: async () => {
            let { data } = await api.get('/personajes');
            return data;
        },
        staleTime: 300000,
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