import { useState, useEffect, useCallback, useMemo } from 'react';

export type Project = {
  ProjectCategory: string;
  Latitude: number;
  Longitude: number;
  Artworks?: unknown[];
  Poems?: unknown[];
  Activities?: string[];
  // Add other fields as needed
};

export function useProjects() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [currentCategory, setCurrentCategory] = useState<string>('');
  const [categories, setCategories] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const projectsResponse = await fetch('https://raw.githubusercontent.com/AdamFehse/map-app/gh-pages/storymapdata_db_ready_v2.json');
        if (!projectsResponse.ok) {
          throw new Error(`HTTP error! status: ${projectsResponse.status}`);
        }
        const projectsData: Project[] = await projectsResponse.json();
        setProjects(projectsData);

        // Extract unique categories from the data
        const uniqueCategories = [...new Set(projectsData.map((project: Project) => project.ProjectCategory).filter(Boolean))];
        setCategories(uniqueCategories);
      } catch (error: unknown) {
        if (error && typeof error === 'object' && 'message' in error) {
          setError((error as { message: string }).message);
        } else {
          setError('Unknown error');
        }
      }
    };
    fetchData();
  }, []);

  const filteredProjects = useMemo(() => {
    if (!currentCategory) return projects;
    return projects.filter((project) => project.ProjectCategory === currentCategory);
  }, [projects, currentCategory]);

  const filterProjects = useCallback((category: string) => {
    setCurrentCategory(category);
  }, []);

  const getProjectsWithArtworks = useCallback(() => {
    return projects.filter((project) => project.Artworks && project.Artworks.length > 0);
  }, [projects]);

  const getProjectsWithPoems = useCallback(() => {
    return projects.filter((project) => project.Poems && project.Poems.length > 0);
  }, [projects]);

  const getUniqueActivities = useCallback(() => {
    const activities = new Set<string>();
    projects.forEach((project) => {
      if (project.Activities) {
        project.Activities.forEach((activity: string) => {
          activities.add(activity);
        });
      }
    });
    return Array.from(activities);
  }, [projects]);

  return {
    projects,
    filteredProjects,
    categories,
    error,
    filterProjects,
    getProjectsWithArtworks,
    getProjectsWithPoems,
    getUniqueActivities,
  };
} 