import './App.css';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom'
import { KYC } from './components/KYC';
import { Home } from './components/Home';
import { withRouter } from 'react-router';
function App() {


  return (
    <Router>
      <Switch>
        <Route path='/' exact component={withRouter(Home)}/>
        <Route path='/kyc' component={withRouter(KYC)}/>
      </Switch>
    </Router>
  );
}

export default App;
