import React, { useState, useEffect } from "react";
import "./App.css";

function App() {
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [password, setPassword] = useState("");
  const [guestbookEntries, setGuestbookEntries] = useState([]);
  const [error, setError] = useState(null); // 에러 상태 추가

  // 백엔드 URL
  const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

  useEffect(() => {
    fetch(`${BACKEND_URL}/api/guestbook`)
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to fetch guestbook entries");
        }
        return response.json();
      })
      .then((data) => setGuestbookEntries(data))
      .catch((error) => {
        console.error("Error fetching guestbook entries:", error);
        setError("Failed to load guestbook entries. Please try again later.");
      });
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    fetch(`${BACKEND_URL}/api/guestbook`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ name, message, password }),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to add guestbook entry");
        }
        return response.json();
      })
      .then((newEntry) => {
        setGuestbookEntries([newEntry, ...guestbookEntries]);
        setName("");
        setMessage("");
        setPassword("");
      })
      .catch((error) => {
        console.error("Error adding guestbook entry:", error);
        setError("Failed to add guestbook entry. Please try again later.");
      });
  };

  const handleDelete = (id) => {
    const userPassword = prompt("비밀번호를 입력하세요:");
    fetch(`${BACKEND_URL}/api/guestbook/${id}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ password: userPassword }),
    })
      .then((response) => {
        if (response.status === 403) {
          alert("비밀번호가 일치하지 않습니다.");
        } else if (response.ok) {
          setGuestbookEntries(guestbookEntries.filter((entry) => entry.id !== id));
        } else {
          throw new Error("Failed to delete guestbook entry");
        }
      })
      .catch((error) => {
        console.error("Error deleting guestbook entry:", error);
        setError("Failed to delete guestbook entry. Please try again later.");
      });
  };

  const handleEdit = (id) => {
    const newMessage = prompt("수정할 메시지를 입력하세요:");
    const userPassword = prompt("비밀번호를 입력하세요:");
    fetch(`${BACKEND_URL}/api/guestbook/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ message: newMessage, password: userPassword }),
    })
      .then((response) => {
        if (response.status === 403) {
          alert("비밀번호가 일치하지 않습니다.");
        } else if (response.ok) {
          return response.json();
        } else {
          throw new Error("Failed to update guestbook entry");
        }
      })
      .then((updatedEntry) => {
        setGuestbookEntries(guestbookEntries.map((entry) => (entry.id === id ? updatedEntry : entry)));
      })
      .catch((error) => {
        console.error("Error updating guestbook entry:", error);
        setError("Failed to update guestbook entry. Please try again later.");
      });
  };

  return (
    <div className="App">
      <h1>방명록</h1>
      {error && <div className="error">{error}</div>} {/* 에러 메시지 표시 */}
      <form onSubmit={handleSubmit}>
        <input type="text" placeholder="이름" value={name} onChange={(e) => setName(e.target.value)} required />
        <textarea placeholder="메시지" value={message} onChange={(e) => setMessage(e.target.value)} required />
        <input
          type="password"
          placeholder="비밀번호"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button type="submit">남기기</button>
      </form>
      <h2>방명록 목록</h2>
      <ul>
        {guestbookEntries.map((entry) => (
          <li key={entry.id}>
            <strong>{entry.name}:</strong> {entry.message} <br />
            <small>{new Date(entry.created_at).toLocaleString()}</small> <br />
            <button onClick={() => handleEdit(entry.id)}>수정</button>
            <button onClick={() => handleDelete(entry.id)}>삭제</button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default App;
