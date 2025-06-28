import React, { useState, useEffect } from 'react';
import './App.css';

type Priority = 'Low' | 'Medium' | 'High';

interface Task {
  id: number;
  text: string;
  completed: boolean;
  priority: Priority;
  dueDate?: string;
}

const PRIORITIES: Priority[] = ['Low', 'Medium', 'High'];

function App() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [taskText, setTaskText] = useState('');
  const [taskPriority, setTaskPriority] = useState<Priority>('Medium');
  const [taskDueDate, setTaskDueDate] = useState('');
  const [searchText, setSearchText] = useState('');
  const [filter, setFilter] = useState<'All' | 'Active' | 'Completed'>('All');
  const [sortBy, setSortBy] = useState<'Priority' | 'DueDate'>('Priority');
  const [editingTaskId, setEditingTaskId] = useState<number | null>(null);
  const [editingText, setEditingText] = useState('');
  const [editingPriority, setEditingPriority] = useState<Priority>('Medium');
  const [editingDueDate, setEditingDueDate] = useState('');

  // Load tasks from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem('tasks');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          setTasks(parsed);
          console.log('Loaded tasks from localStorage:', parsed);
        }
      }
    } catch (error) {
      console.error('Failed to load tasks from localStorage:', error);
    }
  }, []);

  // Save tasks to localStorage on change
  useEffect(() => {
    localStorage.setItem('tasks', JSON.stringify(tasks));
  }, [tasks]);

  // Add new task
  const addTask = () => {
    if (!taskText.trim()) return;
    const newTask: Task = {
      id: Date.now(),
      text: taskText.trim(),
      completed: false,
      priority: taskPriority,
      dueDate: taskDueDate || undefined,
    };
    setTasks(prev => [...prev, newTask]);
    setTaskText('');
    setTaskPriority('Medium');
    setTaskDueDate('');
  };

  // Toggle complete
  const toggleComplete = (id: number) => {
    setTasks(prev =>
      prev.map(t => (t.id === id ? { ...t, completed: !t.completed } : t))
    );
  };

  // Delete task
  const deleteTask = (id: number) => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      setTasks(prev => prev.filter(t => t.id !== id));
    }
  };

  // Start editing
  const startEditing = (task: Task) => {
    setEditingTaskId(task.id);
    setEditingText(task.text);
    setEditingPriority(task.priority);
    setEditingDueDate(task.dueDate || '');
  };

  // Save editing
  const saveEditing = (id: number) => {
    if (!editingText.trim()) return;
    setTasks(prev =>
      prev.map(t =>
        t.id === id
          ? {
              ...t,
              text: editingText.trim(),
              priority: editingPriority,
              dueDate: editingDueDate || undefined,
            }
          : t
      )
    );
    setEditingTaskId(null);
  };

  // Cancel editing
  const cancelEditing = () => {
    setEditingTaskId(null);
  };

  // Filter and search tasks
  const filteredTasks = tasks
    .filter(task => {
      if (filter === 'Active') return !task.completed;
      if (filter === 'Completed') return task.completed;
      return true;
    })
    .filter(task =>
      task.text.toLowerCase().includes(searchText.toLowerCase())
    );

  // Sort tasks
  const sortedTasks = [...filteredTasks].sort((a, b) => {
    if (sortBy === 'Priority') {
      return PRIORITIES.indexOf(a.priority) - PRIORITIES.indexOf(b.priority);
    } else if (sortBy === 'DueDate') {
      if (!a.dueDate) return 1;
      if (!b.dueDate) return -1;
      return a.dueDate.localeCompare(b.dueDate);
    }
    return 0;
  });

  // Stats
  const totalCount = tasks.length;
  const doneCount = tasks.filter(t => t.completed).length;
  const progressPercent = totalCount === 0 ? 0 : Math.round((doneCount / totalCount) * 100);

  return (
    <div className="app-container">
      <header>
        <div className="logo-circle">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="36"
            height="36"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="check-icon"
          >
            <circle cx="12" cy="12" r="10" />
            <path d="M9 12l2 2 4-4" />
          </svg>
        </div>
        <h1>TaskFlow</h1>
        <p className="subtitle">Organize your tasks with style and efficiency</p>
      </header>

      <section className="stats-section">
        <div className="stat-card total">
          <div className="stat-icon">🎯</div>
          <div className="stat-label">Total</div>
          <div className="stat-value">{totalCount}</div>
        </div>
        <div className="stat-card done">
          <div className="stat-icon">✅</div>
          <div className="stat-label">Done</div>
          <div className="stat-value">{doneCount}</div>
        </div>
        <div className="stat-card progress">
          <div className="stat-icon">📅</div>
          <div className="stat-label">Progress</div>
          <div className="stat-value progress-value">{progressPercent}%</div>
        </div>
      </section>

      <section className="input-section">
        <input
          type="text"
          placeholder="What needs to be done?"
          value={taskText}
          onChange={e => setTaskText(e.target.value)}
          onKeyDown={e => {
            if (e.key === 'Enter') addTask();
          }}
          className="task-input"
        />
        <button
          className="priority-flag"
          title="Priority"
          aria-label="Priority"
          onClick={() => {
            // Cycle priority on flag click
            const currentIndex = PRIORITIES.indexOf(taskPriority);
            const nextIndex = (currentIndex + 1) % PRIORITIES.length;
            setTaskPriority(PRIORITIES[nextIndex]);
          }}
        >
          {taskPriority === 'Low' && '🚩'}
          {taskPriority === 'Medium' && '🚩'}
          {taskPriority === 'High' && '🚩'}
        </button>
        <button className="add-task-btn" onClick={addTask}>
          + Add Task
        </button>
      </section>

      <section className="priority-due-section">
        <div className="priority-level">
          <span>Priority Level</span>
          <div className="priority-buttons">
            {PRIORITIES.map(p => (
              <button
                key={p}
                className={`priority-btn ${p === taskPriority ? 'active' : ''}`}
                onClick={() => setTaskPriority(p)}
              >
                {p}
              </button>
            ))}
          </div>
        </div>
        <div className="due-date">
          <label htmlFor="due-date-input">Due Date (Optional)</label>
          <input
            id="due-date-input"
            type="date"
            value={taskDueDate}
            onChange={e => setTaskDueDate(e.target.value)}
            placeholder="dd-mm-yyyy"
          />
        </div>
      </section>

      <section className="search-filter-section">
        <input
          type="search"
          placeholder="Search tasks..."
          value={searchText}
          onChange={e => setSearchText(e.target.value)}
          className="search-input"
        />
        <div className="filter-buttons">
          <span>Filter:</span>
          {['All', 'Active', 'Completed'].map(f => (
            <button
              key={f}
              className={`filter-btn ${filter === f ? 'active' : ''}`}
              onClick={() => setFilter(f as 'All' | 'Active' | 'Completed')}
            >
              {f} Tasks
            </button>
          ))}
        </div>
        <div className="sort-select">
          <label htmlFor="sort-select">Sort:</label>
          <select
            id="sort-select"
            value={sortBy}
            onChange={e => setSortBy(e.target.value as 'Priority' | 'DueDate')}
          >
            <option value="Priority">Priority</option>
            <option value="DueDate">Due Date</option>
          </select>
        </div>
      </section>

      <section className="task-list-section">
        {sortedTasks.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">🎯</div>
            <h2>Ready to be productive?</h2>
            <p>Add your first task above to get started with TaskFlow.</p>
          </div>
        ) : (
          <ul className="task-list">
            {sortedTasks.map(task => (
              <li key={task.id} className={`task-item ${task.completed ? 'completed' : ''}`}>
                <input
                  type="checkbox"
                  checked={task.completed}
                  onChange={() => toggleComplete(task.id)}
                  aria-label={`Mark task "${task.text}" as complete`}
                />
                {editingTaskId === task.id ? (
                  <>
                    <input
                      type="text"
                      value={editingText}
                      onChange={e => setEditingText(e.target.value)}
                      className="edit-text-input"
                    />
                    <div className="edit-priority-buttons">
                      {PRIORITIES.map(p => (
                        <button
                          key={p}
                          className={`priority-btn ${p === editingPriority ? 'active' : ''}`}
                          onClick={() => setEditingPriority(p)}
                        >
                          {p}
                        </button>
                      ))}
                    </div>
                    <input
                      type="date"
                      value={editingDueDate}
                      onChange={e => setEditingDueDate(e.target.value)}
                      className="edit-due-date-input"
                    />
                    <button className="save-btn" onClick={() => saveEditing(task.id)}>
                      Save
                    </button>
                    <button className="cancel-btn" onClick={cancelEditing}>
                      Cancel
                    </button>
                  </>
                ) : (
                  <>
                    <span className="task-text">{task.text}</span>
                    <span className={`priority-label ${task.priority.toLowerCase()}`}>
                      {task.priority}
                    </span>
                    <span className="due-date-label">
                      {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : ''}
                    </span>
                    <button className="edit-btn" onClick={() => startEditing(task)}>
                      Edit
                    </button>
                    <button className="delete-btn" onClick={() => deleteTask(task.id)}>
                      Delete
                    </button>
                  </>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

export default App;
