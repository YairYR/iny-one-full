/* INACTIVO — sin referencias en el repositorio (rev. 2026-08-23).
 *
 * Ningún componente lo consume y llegó con un `// TODO: check` sin resolver. No
 * se borra por si retoma uso cuando se conecte `/api/v1/dashboard/summary` al
 * panel. Al reactivarlo: comprobar la forma que devuelve `getUserLinksSummary`
 * y cubrirlo con un test.
 */

// import { getUserLinksSummary } from "@/features/dashboard/services/getStats";
// import useSWR from "swr";
//
// export const useUserLinksSummary = () => {
//     // TODO: check
//     const { data, error, isLoading, isValidating } = useSWR(['dashboard', 'links', 'summary'], getUserLinksSummary);
//
//     return {
//         data,
//         isLoading,
//         isValidating,
//         error,
//     };
// }
