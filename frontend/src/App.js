import './App.css'
import LandingPage from './Components/LandingPage'
import CustomersPage  from './Components/CustomersPage'
import DashboardPage from './Components/DashboardPage'
import {Routes,Route} from 'react-router-dom'
function App() {
  return (
    <Routes>
      <Route path="/" exact Component={LandingPage} />
      <Route path="/customers" exact Component={CustomersPage}/>
      <Route path="/dashboard" exact Component={DashboardPage}/>
    </Routes>
  )
}

export default App;
