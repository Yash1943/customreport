import { useState, useEffect, useMemo } from 'react'
import './App.css'
import {
  MaterialReactTable,
  useMaterialReactTable,
  type MRT_ColumnDef,
} from 'material-react-table';
import { getFirstReportService } from '../services/service.ts';

function App() {
  const [apiData, setApiData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Extract text after 'report/' from URL
    const path = window.location.pathname;
    const reportText = path.split('report/')[1];
    console.log('Text after report/:', reportText);

    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await getFirstReportService();
        console.log('API Response:', response);
        
        if (response && response.message && Array.isArray(response.message)) {
          setApiData(response.message);
        } else {
          setApiData([]);
          console.warn('API response does not contain expected data format');
        }
        setLoading(false);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to fetch data. Please try again later.');
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  // Get all possible keys from all objects in the array
  const allKeys = useMemo(() => {
    if (!apiData || !Array.isArray(apiData) || apiData.length === 0) return [];
    
    // Collect all unique keys from all objects
    const keySet = new Set();
    apiData.forEach(item => {
      if (typeof item === 'object' && item !== null) {
        Object.keys(item).forEach(key => keySet.add(key));
      }
    });
    
    return Array.from(keySet);
  }, [apiData]);

  // Define columns based on all possible object keys
  const columns = useMemo(() => {
    return allKeys.map(key => ({
      accessorKey: key,
      header: key,
      size: 200,
      Cell: ({ cell }) => {
        const value = cell.getValue();
        // Format complex values
        const displayValue = value === null ? 'null' : 
                            typeof value === 'object' ? JSON.stringify(value) : 
                            String(value);
        
        return (
          <div style={{ 
            maxWidth: '300px', 
            overflow: 'auto', 
            whiteSpace: 'normal', 
            wordBreak: 'break-word' 
          }}>
            {displayValue}
          </div>
        );
      }
    }));
  }, [allKeys]);

  const table = useMaterialReactTable({
    columns,
    data: apiData,
    state: {
      isLoading: loading,
    },
    enableColumnResizing: true,
    layoutMode: 'grid',
    renderEmptyState: () => (
      <div className="flex flex-col items-center justify-center p-4">
        {error ? (
          <p className="text-red-500">{error}</p>
        ) : loading ? (
          <p>Loading data...</p>
        ) : (
          <p>No data available</p>
        )}
      </div>
    ),
  });

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-xl font-bold mb-4">API Response Data</h1>
      <MaterialReactTable table={table} />
    </div>
  );
}

export default App