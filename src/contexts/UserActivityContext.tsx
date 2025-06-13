import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import { fetchActivitiesByLevel, UserDailyActivity } from "../services/api";

type ActivityMap = Map<string, UserDailyActivity>;

interface UserActivityContextType {
  getActivity: (level: string, date: string) => UserDailyActivity | undefined;
  hasStudied: (level: string, date: string) => boolean;
  isLoading: boolean;
  refreshActivities: (level: string) => Promise<void>;
}

const UserActivityContext = createContext<UserActivityContextType>({
  getActivity: () => undefined,
  hasStudied: () => false,
  isLoading: true,
  refreshActivities: async () => {},
});

export const useUserActivities = () => useContext(UserActivityContext);

const LEVELS = ["N3", "N2", "N1"];

export const UserActivityProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [activityMap, setActivityMap] = useState<ActivityMap>(new Map());
  const [isLoading, setIsLoading] = useState(true);

  // Fetch all activities on mount
  useEffect(() => {
    const fetchAll = async () => {
      const map = new Map<string, UserDailyActivity>();
      try {
        for (const level of LEVELS) {
          const activities = await fetchActivitiesByLevel(level);
          activities.forEach((activity) => {
            const key = `${activity.level}_${activity.activity_date}`;
            map.set(key, activity);
          });
        }
        setActivityMap(map);
      } catch (err) {
        console.error("Error loading activities", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchAll();
  }, []);

  const getActivity = useCallback(
    (level: string, date: string) => {
      const key = `${level}_${date}`;
      const activity = activityMap.get(key);
      return activity;
    },
    [activityMap]
  );

  const hasStudied = useCallback(
    (level: string, date: string) => {
      const key = `${level}_${date}`;
      const activity = activityMap.get(key);
      const result = activity?.is_studied ?? false;

      return result;
    },
    [activityMap]
  );

  const refreshActivities = useCallback(async (level: string) => {
    try {
      const activities = await fetchActivitiesByLevel(level);
      setActivityMap((prev) => {
        const newMap = new Map(prev);
        activities.forEach((activity) => {
          const key = `${activity.level}_${activity.activity_date}`;
          newMap.set(key, activity);
        });
        return newMap;
      });
    } catch (error) {
      console.error("Failed to refresh activities", error);
    }
  }, []);

  return (
    <UserActivityContext.Provider
      value={{ getActivity, hasStudied, isLoading, refreshActivities }}
    >
      {children}
    </UserActivityContext.Provider>
  );
};
