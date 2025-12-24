'use client';

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import styles from "./ScheduleMeetingForm.module.css";

export default function ScheduleMeetingForm({ donorId = null, onScheduled = null }) {
  const router = useRouter();
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [duration, setDuration] = useState(30);
  const [title, setTitle] = useState("");
  const [meetingType, setMeetingType] = useState("call");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [userId, setUserId] = useState(null);

  // Fetch current user from session
  useEffect(() => {
    async function fetchSession() {
      try {
        const res = await fetch("/api/auth/session");
        const data = await res.json();
        if (data?.user?.id) {
          setUserId(data.user.id);
        }
      } catch (err) {
        console.error("Failed to fetch session:", err);
      }
    }
    fetchSession();
  }, []);

  function combineDateTime(dateStr, timeStr) {
    if (!dateStr) return null;
    const t = timeStr || "00:00";
    const iso = new Date(`${dateStr}T${t}:00`);
    if (Number.isNaN(iso.getTime())) return null;
    return iso;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!title) return setError("Please enter a title");
    if (!date) return setError("Please select a date");
    if (!userId) return setError("User not logged in");

    const startsAt = combineDateTime(date, time);
    if (!startsAt) return setError("Invalid date/time");

    const endTime = new Date(startsAt.getTime() + duration * 60000);

    setLoading(true);
    try {
      const payload = {
        donorId: 'cmji7c1h20001s5kgyuhd4e3q',
        userId,           // Automatically passed from session
        title,
        startsAt,
        endTime,
        duration: Number(duration),
        meetingType,
        notes,
      };

      const res = await fetch("/api/communications/meetings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body?.error || `Server error ${res.status}`);
      }

      const meeting = await res.json();
      setSuccess("Meeting scheduled!");

      if (meeting.zoomJoinUrl) window.open(meeting.zoomJoinUrl, "_blank");
      onScheduled && typeof onScheduled === "function" && onScheduled(meeting);
      if (donorId) router.push(`/donors/${donorId}`);
    } catch (err) {
      setError(err?.message || "Failed to schedule meeting");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      <div className={styles.grid}>
        <label className={styles.field}>
          <span className={styles.label}>Title</span>
          <input
            className={styles.input}
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </label>

        <label className={styles.field}>
          <span className={styles.label}>Date</span>
          <input
            className={styles.input}
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
          />
        </label>

        <label className={styles.field}>
          <span className={styles.label}>Time</span>
          <input
            className={styles.input}
            type="time"
            value={time}
            onChange={(e) => setTime(e.target.value)}
          />
        </label>

        <label className={styles.field}>
          <span className={styles.label}>Duration (minutes)</span>
          <input
            className={styles.input}
            type="number"
            min={5}
            step={5}
            value={duration}
            onChange={(e) => setDuration(e.target.value)}
          />
        </label>

        <label className={styles.field}>
          <span className={styles.label}>Type</span>
          <select
            className={styles.select}
            value={meetingType}
            onChange={(e) => setMeetingType(e.target.value)}
          >
            <option value="call">Call</option>
            <option value="meeting">Meeting</option>
            <option value="thank_you">Thank You</option>
          </select>
        </label>

        <label className={styles.field}>
          <span className={styles.label}>Notes</span>
          <textarea
            className={styles.textarea}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </label>

        {error && <div className={styles.error}>{error}</div>}
        {success && <div className={styles.success}>{success}</div>}

        <div className={styles.actions}>
          <button className={styles.button} type="submit" disabled={loading}>
            {loading ? "Scheduling…" : "Schedule Meeting"}
          </button>
        </div>
      </div>
    </form>
  );
}
