import React, { useState, useEffect } from "react";
import "./App.css";

function App() {
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [password, setPassword] = useState("");
  const [guestbookEntries, setGuestbookEntries] = useState([]);

  // 백엔드 URL
  const BACKEND_URL = "https://port-0-guestbook-backend-m2k9vm870c02b857.sel4.cloudtype.app";

  useEffect(() => {
    fetch(`${BACKEND_URL}/api/guestbook`)
      .then((response) => response.json())
      .then((data) => setGuestbookEntries(data));
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
      .then((response) => response.json())
      .then((newEntry) => {
        setGuestbookEntries([newEntry, ...guestbookEntries]);
        setName("");
        setMessage("");
        setPassword("");
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
    }).then((response) => {
      if (response.status === 403) {
        alert("비밀번호가 일치하지 않습니다.");
      } else {
        setGuestbookEntries(guestbookEntries.filter((entry) => entry.id !== id));
      }
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
    }).then((response) => {
      if (response.status === 403) {
        alert("비밀번호가 일치하지 않습니다.");
      } else {
        response.json().then((updatedEntry) => {
          setGuestbookEntries(guestbookEntries.map((entry) => (entry.id === id ? updatedEntry : entry)));
        });
      }
    });
  };

  return (
    <div className="App">
      <h1>방명록</h1>
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
