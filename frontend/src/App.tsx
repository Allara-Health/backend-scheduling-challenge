import React, { useState, useEffect, ChangeEvent } from 'react';
import './App.css';

const API_URL = 'http://localhost:3001/';

interface Provider {
  id: number;
  name: string;
  availabilityStart: string;
  availabilityEnd: string;
}

interface Schedule {
  [key: string]: string[];
}

const App: React.FC = () => {
  const [providers, setProviders] = useState<Provider[]>([]);
  const [schedule, setSchedule] = useState<Schedule>({});
  const [name, setName] = useState<string>('');
  const [availabilityStart, setAvailabilityStart] = useState<string>('');
  const [availabilityEnd, setAvailabilityEnd] = useState<string>('');
  const [editingProvider, setEditingProvider] = useState<Provider | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchProviders();
  }, []);

  const fetchProviders = () => {
    fetch(`${API_URL}providers`)
      .then((response) => {
        if (!response.ok) {
          throw new Error('Failed to fetch providers');
        }
        return response.json();
      })
      .then((data) => setProviders(data))
      .catch((error) => setError(error.message));
  };

  const handleAddOrUpdateProvider = () => {
    if (!name || !availabilityStart || !availabilityEnd) {
      setError('Please fill in all fields');
      return;
    }

    const method = editingProvider ? 'PUT' : 'POST';
    const url = editingProvider
      ? `${API_URL}providers/${editingProvider.id}`
      : `${API_URL}providers`;

    fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name, availabilityStart, availabilityEnd }),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error(
            `Failed to ${editingProvider ? 'update' : 'add'} provider`
          );
        }
        return response.json();
      })
      .then(() => {
        fetchProviders();
        resetForm();
      })
      .catch((error) => setError(error.message));
  };

  const handleDeleteProvider = (id: number) => {
    fetch(`${API_URL}providers/${id}`, {
      method: 'DELETE',
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error('Failed to delete provider');
        }
        fetchProviders();
      })
      .catch((error) => setError(error.message));
  };

  const handleEditProvider = (provider: Provider) => {
    setEditingProvider(provider);
    setName(provider.name);
    setAvailabilityStart(provider.availabilityStart);
    setAvailabilityEnd(provider.availabilityEnd);
  };

  const resetForm = () => {
    setName('');
    setAvailabilityStart('');
    setAvailabilityEnd('');
    setEditingProvider(null);
  };

  const fetchSchedule = () => {
    fetch(`${API_URL}schedule`)
      .then((response) => {
        if (!response.ok) {
          throw new Error('Failed to fetch schedule');
        }
        return response.json();
      })
      .then((data) => setSchedule(data.schedule))
      .catch((error) => setError(error.message));
  };

  return (
    <div className='App'>
      <h1>Telehealth Scheduling System</h1>
      {error && <div className='error'>{error}</div>}
      <div className='form-container'>
        <h2>{editingProvider ? 'Edit Provider' : 'Add Provider'}</h2>
        <input
          type='text'
          placeholder='Name'
          value={name}
          onChange={(e: ChangeEvent<HTMLInputElement>) =>
            setName(e.target.value)
          }
        />
        <input
          type='time'
          placeholder='Availability Start'
          value={availabilityStart}
          onChange={(e: ChangeEvent<HTMLInputElement>) =>
            setAvailabilityStart(e.target.value)
          }
        />
        <input
          type='time'
          placeholder='Availability End'
          value={availabilityEnd}
          onChange={(e: ChangeEvent<HTMLInputElement>) =>
            setAvailabilityEnd(e.target.value)
          }
        />
        <button onClick={handleAddOrUpdateProvider}>
          {editingProvider ? 'Update Provider' : 'Add Provider'}
        </button>
        {editingProvider && <button onClick={resetForm}>Cancel</button>}
      </div>
      <div className='providers-container'>
        <h2>Providers</h2>
        <ul>
          {providers.map((provider) => (
            <li key={provider.id}>
              {provider.name} ({provider.availabilityStart} -{' '}
              {provider.availabilityEnd})
              <button onClick={() => handleEditProvider(provider)}>Edit</button>
              <button onClick={() => handleDeleteProvider(provider.id)}>
                Delete
              </button>
            </li>
          ))}
        </ul>
      </div>
      <div className='schedule-container'>
        <h2>Schedule</h2>
        <button onClick={fetchSchedule}>Get Schedule</button>
        <ul>
          {Object.entries(schedule).map(([provider, times]) => (
            <li key={provider}>
              <strong>{provider}</strong>
              <ul>
                {times.map((time, index) => (
                  <li key={index}>{time}</li>
                ))}
              </ul>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default App;
