import { Course, LearnifierProject, Project } from "../types/models";
import { participationResponse } from "../types/responses";

const endpointURL = process.env.LEARNIFIER;
const organizationId = process.env.ORGANIZATION_ID;
const username = process.env.LEARNIFIER_PUBLIC_KEY;
const password = process.env.LEARNIFIER_SECRET_KEY;
const ORGANIZATION_ID = process.env.ORGANIZATION_ID;

// Check if Learnifier credentials are available
const hasLearnifierCredentials =
  username && password && endpointURL && ORGANIZATION_ID;
const auth = hasLearnifierCredentials ? btoa(`${username}:${password}`) : null;

interface props {
  user: {
    email: string;
  };
  team: {
    courses: { learnifierId: string }[];
  };
}

export const addUserToProject = async ({ user, team }: props) => {
  if (!hasLearnifierCredentials) {
    console.warn(
      "Learnifier credentials not available, skipping user project addition"
    );
    return;
  }

  try {
    if (user && team) {
      await Promise.all(
        team.courses.map(async (course) => {
          await fetch(
            `${endpointURL}/orgunits/${ORGANIZATION_ID}/projects/${course.learnifierId}/createParticipant`,
            {
              method: "POST",
              headers: {
                "Content-type": "application/json",
                Authorization: `Basic ${auth}`,
              },
              body: JSON.stringify({
                email: user.email,
                activate: true,
              }),
            }
          );
        })
      );
    }
  } catch (error) {
    console.error(error);
    throw new Error("Unable to add user to project");
  }
};

export const removeUserFromProject = async (
  participantId: number,
  projectId: number
) => {
  if (!hasLearnifierCredentials) {
    console.warn(
      "Learnifier credentials not available, skipping user project removal"
    );
    return;
  }

  try {
    if (participantId) {
      await fetch(
        `${endpointURL}/orgunits/${ORGANIZATION_ID}/projects/${projectId}/participants/${participantId}`,
        {
          method: "DELETE",
          headers: {
            "Content-type": "application/json",
            Authorization: `Basic ${auth}`,
          },
        }
      );
    }
  } catch {
    throw new Error("Unable to remove user from project");
  }
  return;
};

export const removeUserFromProjects = async (learnifierId: string) => {
  if (!hasLearnifierCredentials) {
    console.warn(
      "Learnifier credentials not available, skipping user projects removal"
    );
    return;
  }

  try {
    const list = await participationList(learnifierId);
    if (list && Array.isArray(list)) {
      // Process each project participation
      await Promise.all(
        list.map(async (v) => {
          try {
            await removeUserFromProject(v.id, v.projectId);
          } catch (projectError) {
            console.warn(
              `Failed to remove user from project ${v.projectId}, but continuing: `,
              projectError
            );
          }
        })
      );
    }
  } catch (apiError) {
    // Log Learnifier API error but continue with seat removal
    console.error(
      "Error with Learnifier API, continuing with seat removal:",
      apiError
    );
  }
};

export const participationList = async (
  learnifierId: string | undefined | null
): Promise<participationResponse[] | undefined> => {
  if (!learnifierId || !hasLearnifierCredentials) return undefined;

  try {
    const request = await fetch(
      `${endpointURL}/users/${learnifierId}/projectParticipations`,
      {
        method: "GET",
        headers: {
          "Content-type": "application/json",
          Authorization: `Basic ${auth}`,
        },
      }
    );
    const response = await request.json();
    return response.length > 0
      ? response.map((v: participationResponse) => {
          return {
            projectName: v.projectName,
            accessLink: v.accessLink,
            id: v.id,
            projectId: v.projectId,
            firstAccess: v.firstAccess,
            firstCompleted: v.firstCompleted,
          };
        })
      : undefined;
  } catch (error) {
    console.error("Error fetching participation list:", error);
    return undefined;
  }
};

export const addCourseActivityData = async (learnifierId: string, courses: Course[]) => {
  let updatedCourses = [...courses];

  if (!learnifierId || !hasLearnifierCredentials) return updatedCourses;

  const particiationList = await participationList(learnifierId);
  if (!particiationList) return updatedCourses;

  const lookup = new Map(
    particiationList.map((project) => [
      project.projectId,
      {
        firstAccess: project.firstAccess,
        firstCompleted: project.firstCompleted,
      },
    ])
  );

  updatedCourses = updatedCourses.map(course => {
    const match = lookup.get(Number(course.learnifierId));
    return match ? { ...course, ...match } : course;
  });

  return updatedCourses;
};

export const getCourseData = async (learnifierId: string) => {
  if (!hasLearnifierCredentials) {
    console.warn("Learnifier credentials not available, returning empty course data");
    return [];
  }

  try {
    const request = await fetch(
      `${endpointURL}/users/${learnifierId}/projectParticipations`,
      {
        method: "GET",
        headers: {
          "Content-type": "application/json",
          Authorization: `Basic ${auth}`,
        },
      }
    );
    const response = await request.json();
    const projectData: LearnifierProject[] = await Promise.all(
      response.map(async (project: Project) => {
        const loginLink = await getLoginLink(project.id, project.projectId);
        return {
          projectName: project.projectName,
          loginLink: loginLink,
          learnifierId: project.projectId
        };
      })
    );

    return projectData;
  } catch (error) {
    console.error("Error fetching course data:", error);
    return [];
  }
};

export const getLoginLink = async (
  participationId: string,
  projectId: string
) => {
  if (!hasLearnifierCredentials) {
    console.warn("Learnifier credentials not available, returning empty login link");
    return "";
  }
  
  try {
    const request = await fetch(
      `${endpointURL}/orgunits/${organizationId}/projects/${projectId}/participants/${participationId}/loginlink`,
      {
        method: "GET",
        headers: {
          "Content-type": "application/json",
          Authorization: `Basic ${auth}`,
        },
      }
    );
    const response = await request.json();
    return response.link;
  } catch (error) {
    console.error("Error fetching login link:", error);
    return "";
  }
};
