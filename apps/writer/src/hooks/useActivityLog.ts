"use client";

import { useState, useCallback, useEffect } from 'react';
import { ActivityLogEntry } from '@/components/ActivityLog';

const STORAGE_KEY = 'writer_activity_log';

export const useActivityLog = () => {
  const [activities, setActivities] = useState<ActivityLogEntry[]>([]);

  // Load activities from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        // Convert timestamp strings back to Date objects
        const activities = parsed.map((activity: any) => ({
          ...activity,
          timestamp: new Date(activity.timestamp)
        }));
        setActivities(activities);
      }
    } catch (error) {
      console.error('Failed to load activity log:', error);
    }
  }, []);

  // Save activities to localStorage whenever activities change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(activities));
    } catch (error) {
      console.error('Failed to save activity log:', error);
    }
  }, [activities]);

  const addActivity = useCallback((
    type: ActivityLogEntry['type'],
    title: string,
    description: string,
    details?: ActivityLogEntry['details'],
    status: ActivityLogEntry['status'] = 'success',
    user?: string
  ) => {
    const newActivity: ActivityLogEntry = {
      id: `activity_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
      type,
      title,
      description,
      details,
      status,
      user: user || 'User'
    };

    setActivities(prev => [newActivity, ...prev]);
    return newActivity.id;
  }, []);

  const updateActivityStatus = useCallback((id: string, status: ActivityLogEntry['status']) => {
    setActivities(prev => 
      prev.map(activity => 
        activity.id === id ? { ...activity, status } : activity
      )
    );
  }, []);

  const removeActivity = useCallback((id: string) => {
    setActivities(prev => prev.filter(activity => activity.id !== id));
  }, []);

  const clearAll = useCallback(() => {
    setActivities([]);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  const exportLog = useCallback(() => {
    const dataStr = JSON.stringify(activities, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `activity_log_${new Date().toISOString().split('T')[0]}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  }, [activities]);

  // Helper functions for specific activity types
  const logFormula = useCallback((formula: string, result: string) => {
    return addActivity(
      'formula',
      'Formula Dihitung',
      `Menghitung rumus matematika`,
      { formula, result },
      'success'
    );
  }, [addActivity]);

  const logEdit = useCallback((title: string, oldValue?: string, newValue?: string, wordCount?: number) => {
    return addActivity(
      'edit',
      'Konten Diedit',
      title,
      { oldValue, newValue, wordCount },
      'success'
    );
  }, [addActivity]);

  const logSave = useCallback((title: string, wordCount?: number) => {
    return addActivity(
      'save',
      'Draft Disimpan',
      title,
      { wordCount },
      'success'
    );
  }, [addActivity]);

  const logTransform = useCallback((title: string, description: string, details?: any) => {
    return addActivity(
      'transform',
      title,
      description,
      details,
      'success'
    );
  }, [addActivity]);

  const logError = useCallback((title: string, description: string, details?: any) => {
    return addActivity(
      'transform',
      title,
      description,
      details,
      'error'
    );
  }, [addActivity]);

  return {
    activities,
    addActivity,
    updateActivityStatus,
    removeActivity,
    clearAll,
    exportLog,
    // Helper functions
    logFormula,
    logEdit,
    logSave,
    logTransform,
    logError,
  };
};