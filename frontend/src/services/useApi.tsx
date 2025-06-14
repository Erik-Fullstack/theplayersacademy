import { useQueryClient } from "@tanstack/react-query";

import { createTeamApiHooks } from "./api/entities/teams";
import { createOrgApiHooks } from "./api/entities/organizations";
import { createOrgcourseApiHooks } from "./api/entities/orgcourses";
import { createCourseApiHooks } from "./api/entities/courses";
import { createUserApiHooks } from "./api/entities/users";
import { createInviteApiHooks } from "./api/entities/invites";
import { createSeatApiHooks } from "./api/entities/seats";
import { createGameFormatApiHooks } from "./api/entities/gameformats";
import { createDocumentApiHooks } from "./api/entities/documents";
import { createFeedbackApiHooks } from "./api/entities/feedback";
import { createSubscriptionApiHooks } from "./api/entities/subscriptions";
import { createPagesApiHooks } from "./api/entities/pages";
import { createTestApiHooks } from "./api/entities/test";

/**
 * Custom hook that provides access to all API services in the application
 *
 * This hook centralizes access to data fetching and mutation operations for all entity types,
 * using React Query for caching and state management. Each property returns a collection
 * of entity-specific hooks for common operations (list, get by ID, create, update, delete).
 *
 * @returns An object containing API hooks grouped by entity type
 *
 * @example
 * // Access API hooks in a component
 * function TeamList() {
 *   const api = useApi();
 *
 *   // Fetch teams
 *   const { data: teamsResponse, isLoading } = api.teams.useList();
 *
 *   // Create a new team
 *   const { mutate: createTeam } = api.teams.useCreate();
 *
 *   // Use the data
 *   if (isLoading) return <div>Loading...</div>;
 *
 *   return (
 *     <div>
 *       <h1>Teams</h1>
 *       <ul>
 *         {teamsResponse?.data.map(team => (
 *           <li key={team.id}>{team.name}</li>
 *         ))}
 *       </ul>
 *       <button onClick={() => createTeam({ name: 'New Team' })}>
 *         Add Team
 *       </button>
 *     </div>
 *   );
 * }
 */
export function useApi() {
  const queryClient = useQueryClient();

  return {
    teams: createTeamApiHooks(queryClient),
    courses: createCourseApiHooks(queryClient),
    organizations: createOrgApiHooks(queryClient),
    invites: createInviteApiHooks(queryClient),
    orgcourses: createOrgcourseApiHooks(queryClient),
    users: createUserApiHooks(queryClient),
    seats: createSeatApiHooks(queryClient),
    documents: createDocumentApiHooks(queryClient),
    feedback: createFeedbackApiHooks(queryClient),
    gameformats: createGameFormatApiHooks(queryClient),
    subscriptions: createSubscriptionApiHooks(queryClient),
    pages: createPagesApiHooks(queryClient),
    test: createTestApiHooks(queryClient),
  };
}
