import { createContext, useContext, useState, useEffect } from 'react';
import usersData from '../data/users.json';
import buildingsData from '../data/buildings.json';
import coursesData from '../data/courses.json';

const DataContext = createContext();

export const DataProvider = ({ children }) => {
  const [users, setUsers] = useState(usersData);
  const [buildings, setBuildings] = useState(buildingsData);
  const [courses, setCourses] = useState(coursesData);
  
  // A mock currently logged in user
  const currentUser = users[0];

  return (
    <DataContext.Provider value={{ users, buildings, courses, currentUser }}>
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => useContext(DataContext);
