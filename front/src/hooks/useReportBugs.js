import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../api/api.js';

export const useReportBugs = () => {
    const queryClient = useQueryClient();

    /**
     * Obtiene el listado de reportes de bugs (propios, o todos si es admin).
     * Acepta filtros opcionales: { estado, tipo }
     */
    const useReportesList = (filtros = {}) => {
        return useQuery({
            queryKey: ['reportes-bugs', filtros],
            queryFn: async () => {
                const { data } = await api.get('/reportes-bugs', { params: filtros });
                return data;
            },
            staleTime: 60000,
        });
    };

    /**
     * Obtiene un reporte concreto junto a sus comentarios.
     * @param {number|string} id
     */
    const useReporte = (id) => {
        return useQuery({
            queryKey: ['reportes-bugs', id],
            queryFn: async () => {
                const { data } = await api.get(`/reportes-bugs/${id}`);
                return data;
            },
            enabled: !!id,
            staleTime: 60000,
        });
    };

    /**
     * Obtiene un reporte mediante su `id` de forma imperativa (fuera de un componente/render).
     * @param {number|string} id
     */
    const getReporte = async (id) => {
        try {
            const { data } = await api.get(`/reportes-bugs/${id}`);
            return data;
        } catch (error) {
            console.error("Error al obtener el reporte:", error.response?.data?.message);
            throw error;
        }
    };

    /**
     * Crea un nuevo reporte de bug.
     */
    const newReporte = useMutation({
        mutationFn: async (dataToSend) => {
            const { data } = await api.post('/reportes-bugs', dataToSend);
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['reportes-bugs'] });
        }
    });

    /**
     * Actualiza un reporte propio (descripción, tipo, logs, plataforma, screenshot).
     */
    const updateReporte = useMutation({
        mutationFn: async ({ id, dataToSend }) => {
            const { data } = await api.patch(`/reportes-bugs/${id}`, dataToSend);
            return data;
        },
        onSuccess: (data, variables) => {
            queryClient.invalidateQueries({ queryKey: ['reportes-bugs'] });
            queryClient.setQueryData(['reportes-bugs', variables.id], data);
        }
    });

    /**
     * Cambia el estado/severidad de un reporte (solo admin).
     */
    const updateEstadoReporte = useMutation({
        mutationFn: async ({ id, dataToSend }) => {
            const { data } = await api.patch(`/reportes-bugs/${id}/estado`, dataToSend);
            return data;
        },
        onSuccess: (data, variables) => {
            queryClient.invalidateQueries({ queryKey: ['reportes-bugs'] });
            queryClient.setQueryData(['reportes-bugs', variables.id], data);
        }
    });

    /**
     * Elimina un reporte propio (o cualquiera si es admin).
     */
    const deleteReporte = useMutation({
        mutationFn: async (id) => {
            const { data } = await api.delete(`/reportes-bugs/${id}`);
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['reportes-bugs'] });
        }
    });

    /**
     * Obtiene los comentarios de un reporte.
     * @param {number|string} reporteId
     */
    const useComentarios = (reporteId) => {
        return useQuery({
            queryKey: ['reportes-bugs', reporteId, 'comentarios'],
            queryFn: async () => {
                const { data } = await api.get(`/reportes-bugs/${reporteId}/comentarios`);
                return data;
            },
            enabled: !!reporteId,
            staleTime: 30000,
        });
    };

    /**
     * Crea un comentario en un reporte.
     */
    const newComentario = useMutation({
        mutationFn: async ({ reporteId, dataToSend }) => {
            const { data } = await api.post(`/reportes-bugs/${reporteId}/comentarios`, dataToSend);
            return data;
        },
        onSuccess: (_data, variables) => {
            queryClient.invalidateQueries({ queryKey: ['reportes-bugs', variables.reporteId, 'comentarios'] });
        }
    });

    /**
     * Edita un comentario propio.
     */
    const updateComentario = useMutation({
        mutationFn: async ({ reporteId, comentarioId, dataToSend }) => {
            const { data } = await api.patch(`/reportes-bugs/${reporteId}/comentarios/${comentarioId}`, dataToSend);
            return data;
        },
        onSuccess: (_data, variables) => {
            queryClient.invalidateQueries({ queryKey: ['reportes-bugs', variables.reporteId, 'comentarios'] });
        }
    });

    /**
     * Elimina un comentario (autor o admin).
     */
    const deleteComentario = useMutation({
        mutationFn: async ({ reporteId, comentarioId }) => {
            const { data } = await api.delete(`/reportes-bugs/${reporteId}/comentarios/${comentarioId}`);
            return data;
        },
        onSuccess: (_data, variables) => {
            queryClient.invalidateQueries({ queryKey: ['reportes-bugs', variables.reporteId, 'comentarios'] });
        }
    });

    return {
        // Reportes
        useReportesList,
        useReporte,
        getReporte,
        newReporte: async (dataToSend) => newReporte.mutateAsync(dataToSend),
        updateReporte: async (id, dataToSend) => updateReporte.mutateAsync({ id, dataToSend }),
        updateEstadoReporte: async (id, dataToSend) => updateEstadoReporte.mutateAsync({ id, dataToSend }),
        deleteReporte: async (id) => deleteReporte.mutateAsync(id),

        // Comentarios
        useComentarios,
        newComentario: async (reporteId, dataToSend) => newComentario.mutateAsync({ reporteId, dataToSend }),
        updateComentario: async (reporteId, comentarioId, dataToSend) =>
            updateComentario.mutateAsync({ reporteId, comentarioId, dataToSend }),
        deleteComentario: async (reporteId, comentarioId) =>
            deleteComentario.mutateAsync({ reporteId, comentarioId }),

        isCreating: newReporte.isPending,
        isUpdating: updateReporte.isPending,
        isDeleting: deleteReporte.isPending,
    };
};