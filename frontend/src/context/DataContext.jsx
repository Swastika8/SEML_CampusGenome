import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import usersData from '../data/users.json';
import buildingsData from '../data/buildings.json';
import coursesData from '../data/courses.json';

const DataContext = createContext();

const API_BASE = 'http://localhost:5000/api';

export const DataProvider = ({ children }) => {
  const [users, setUsers] = useState(usersData);
  const [buildings, setBuildings] = useState(buildingsData);
  const [courses, setCourses] = useState(coursesData);
  const [nodes, setNodes] = useState([]);
  const [lifestyle, setLifestyle] = useState(null);
  const [events, setEvents] = useState([]);
  const [career, setCareer] = useState([]);
  const [communities, setCommunities] = useState([]);

  const refreshData = useCallback(async () => {
    try {
      const [bRes, uRes, cRes, nRes, lRes, eRes, carRes, comRes] = await Promise.allSettled([
        fetch(`${API_BASE}/buildings`).then(r => r.ok ? r.json() : null),
        fetch(`${API_BASE}/users/leaderboard`).then(r => r.ok ? r.json() : null),
        fetch(`${API_BASE}/courses`).then(r => r.ok ? r.json() : null),
        fetch(`${API_BASE}/nodes`).then(r => r.ok ? r.json() : null),
        fetch(`${API_BASE}/lifestyle`).then(r => r.ok ? r.json() : null),
        fetch(`${API_BASE}/events`).then(r => r.ok ? r.json() : null),
        fetch(`${API_BASE}/career`).then(r => r.ok ? r.json() : null),
        fetch(`${API_BASE}/communities`).then(r => r.ok ? r.json() : null),
      ]);

      if (bRes.status === 'fulfilled' && bRes.value?.data?.length > 0) {
        setBuildings(bRes.value.data);
      }
      if (uRes.status === 'fulfilled' && uRes.value?.data?.length > 0) {
        setUsers(uRes.value.data);
      }
      if (cRes.status === 'fulfilled' && cRes.value?.data?.length > 0) {
        setCourses(cRes.value.data);
      }
      if (nRes.status === 'fulfilled' && nRes.value?.data?.length > 0) {
        setNodes(nRes.value.data);
      }
      if (lRes.status === 'fulfilled' && lRes.value?.data) {
        setLifestyle(lRes.value.data);
      }
      if (eRes.status === 'fulfilled' && eRes.value?.data?.length > 0) {
        setEvents(eRes.value.data);
      }
      if (carRes.status === 'fulfilled' && carRes.value?.data?.length > 0) {
        setCareer(carRes.value.data);
      }
      if (comRes.status === 'fulfilled' && comRes.value?.data?.length > 0) {
        setCommunities(comRes.value.data);
      }
    } catch {
      // Fallback silently to mock data
    }
  }, []);

  useEffect(() => {
    refreshData();
  }, [refreshData]);
  
  // A mock currently logged in user
  const currentUser = users[0];

  return (
    <DataContext.Provider 
      value={{ 
        users, 
        buildings, 
        courses, 
        nodes, 
        lifestyle, 
        events, 
        career, 
        communities, 
        currentUser, 
        refreshData 
      }}
    >
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => useContext(DataContext);

