import Container from 'react-bootstrap/Container';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import NavDropdown from 'react-bootstrap/NavDropdown';

function Sidebar() {
  return (
    <Navbar expand="lg" className="bg-body-tertiary">
      <Container>
        <Navbar.Brand href="#clock">YatPotato</Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto">
            <Nav.Link href="#clock">Clock</Nav.Link>
            <Nav.Link href="#todo">Todo</Nav.Link>
            <NavDropdown title="Analytics" id="analytics-dropdown">
              <NavDropdown.Item href="#year">year</NavDropdown.Item>
              <NavDropdown.Item href="#month">month</NavDropdown.Item>
              <NavDropdown.Item href="#day">day</NavDropdown.Item>
            </NavDropdown>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}

export default Sidebar;