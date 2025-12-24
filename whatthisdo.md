

ZOOM MEETING FUNCTION - FRONTEND

This function handles form submission for scheduling a meeting.
It validates input, sends meeting details to the backend, saves the meeting, optionally creates a Zoom meeting, opens the Zoom link automatically, updates the UI, and redirects the user back to the donor page — all while handling errors safely.

It takes form data → validates it → creates a meeting via the API → opens Zoom → updates the UI → redirects the user.

async function handleSubmit(e) {
		e.preventDefault()
		setError(null)
		//clears any previous error messages
		setSuccess(null)
		//clears any sucsess messages 
		//makes a clean ui for new form submissionas

		if (!date) return setError("Please select a date")
		const startsAt = combineDateTime(date, time)
		if (!startsAt) return setError("Invalid date/time")
			//Guards against invalid date/time values.

		setLoading(true)
		//disables the button and shows “Scheduling…” we use this at the bottom of the page 
		try {
			const payload = {
				donorId,
				startsAt,
				durationMinutes: Number(duration) || 30,
				meetingType,
				notes,
			}

			const res = await fetch("/api/communications/meetings", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(payload),
			})

			if (!res.ok) {
				const body = await res.json().catch(() => ({}))
				//If parsing fails, defaults to an empty object.
				throw new Error(body?.error || `Server error ${res.status}`)
				//error converter?
			}

			const meeting = await res.json()

			setSuccess("Meeting scheduled!")

			// Auto-open Zoom join URL for the donor
			if (meeting.zoomJoinUrl) {
				window.open(meeting.zoomJoinUrl, "_blank")
			}
			//If Zoom info exists, automatically opens the Zoom meeting.
			//_blank opens it in a new tab/window.

			if (onScheduled && typeof onScheduled === "function") {
				onScheduled(meeting)
			}
			//Calls a callback function (if provided).
			//Allows parent components to react (refresh lists, close modal, etc).

			if (donorId) router.push(`/donors/${donorId}`)
				//Navigates the user back to the donor’s profile page.
		} catch (err) {
			setError(err?.message || "Failed to schedule meeting")
		} finally {
			setLoading(false)
		}
	}


    THOUGHT SESSION WAS WRONG FOR A SEC BUT ITS NOT.

      Session stores login/auth info for a user.

        token is used to authenticate requests.

        refreshToken can be used to renew session.

        userId links the session to a User.

        Does not directly store organizationId or other business info — only what is necessary to identify and manage the session.

        Tracks timestamps like expiresAt and lastActivityAt.

        ✅ Key takeaway: The session API acts as a bridge to get authenticated user info, including organization, but the Session model itself only stores authentication-specific fields.



    