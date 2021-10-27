import Card from "react-bootstrap/Card";

const PlayerCard = (props) => {
    return (
        <>
        <Card style={{ width: "22rem" }}>
            <Card.Body>
            <Card.Title style={{ color: "black" }}>GEEKSFORGEEKS</Card.Title>
            <Card.Subtitle className="mb-2 text-muted">
                One Stop For all CS subjects
            </Card.Subtitle>
            <Card.Text>
                GeeksforGeeks provides a platform for all the students to study
                about all the subjects in CSE.
                <img src="../playerprofile.png" class="rounded float-left" alt=".."></img>
            </Card.Text>
            <Card.Link href="#"> For Students</Card.Link>
            </Card.Body>
        </Card>
        </>
    );
  };
  
  export default PlayerCard;