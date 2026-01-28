import React, { useEffect, useState } from "react";
import "./DummyUserList.css";

interface Geo {
  lat: string;
  lng: string;
}

interface Address {
  street: string;
  suite: string;
  city: string;
  zipcode: string;
  geo: Geo;
}

interface Company {
  name: string;
  catchPhrase: string;
  bs: string;
}

export interface User {
  id: number;
  name: string;
  username: string;
  email: string;
  address: Address;
  phone: string;
  website: string;
  company: Company;
}

const DummyUserList: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("https://jsonplaceholder.typicode.com/users")
      .then((res) => res.json())
      .then((data: User[]) => {
        setUsers(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  /** OPEN OUTLOOK DIALOG & SEND DATA */
  const openUserDialog = (user: User) => {
    const dialogUrl = `${window.location.origin}/dialog.html`;

    Office.context.ui.displayDialogAsync(
      dialogUrl,
      {
        height: 50,
        width: 50,
        displayInIframe: true,
      },
      (result) => {
        const dialog = result.value;

        // Wait for dialog_ready → then send user data
        dialog.addEventHandler(Office.EventType.DialogMessageReceived, (arg: any) => {
          console.log("message ::", arg);
          if (arg.message === "dialog_ready") {
            dialog.messageChild(JSON.stringify(user));
          }
        });
      }
    );
  };

  if (loading) return <h2>Loading...</h2>;

  return (
    <div className="user-list-container">
      {users.map((user) => (
        <div key={user.id} className="user-card">
          <h2 className="user-name" onClick={() => openUserDialog(user)}>
            {user.name}
          </h2>

          <p>
            <strong>Username:</strong> {user.username}
          </p>
          <p>
            <strong>Email:</strong> {user.email}
          </p>
          <p>
            <strong>Phone:</strong> {user.phone}
          </p>

          <div className="user-section">
            <strong>Address:</strong>
            <p>
              {user.address.street}, {user.address.suite}, {user.address.city} (
              {user.address.zipcode})
            </p>
          </div>

          <div className="user-section">
            <strong>Company:</strong>
            <p>{user.company.name}</p>
            <em>{user.company.catchPhrase}</em>
          </div>

          <p>
            <strong>Website:</strong> {user.website}
          </p>
        </div>
      ))}
    </div>
  );
};

export default DummyUserList;
