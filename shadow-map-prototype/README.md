# SHADOW MAP - Urban Disaster Intelligence Platform
## Hackathon Prototype

A real-time AI-driven platform for urban disaster intelligence, infrastructure risk assessment, and emergency response optimization.

### Features
- **Real-time Data Ingestion**: Simulated streams of rainfall, seismic activity, grid voltage, traffic congestion
- **Digital Twin**: Dynamic city infrastructure model showing interdependencies
- **Risk Assessment**: Cascading failure prediction for hospitals, substations, water plants, bridges
- **Live Dashboard**: Real-time visualization of city status and risk metrics
- **Resource Optimization**: Ambulance routing, hospital bed tracking, rescue prioritization
- **Emergency Alerts**: Dynamic risk scoring and strategic recommendations

### Tech Stack
- **Backend**: Python with FastAPI
- **Frontend**: React with TypeScript & Vite
- **Real-time**: WebSockets for live data streaming
- **Database**: SQLite (development), PostgreSQL ready
- **Visualization**: D3.js for infrastructure map, Chart.js for metrics

### Project Structure
```
shadow-map-prototype/
├── backend/                 # FastAPI application
│   ├── app/
│   │   ├── main.py
│   │   ├── models.py       # Data models
│   │   ├── risk_engine.py  # Risk assessment logic
│   │   ├── data_simulator.py # Mock data generation
│   │   └── routes/
│   │       ├── infrastructure.py
│   │       ├── risks.py
│   │       └── resources.py
│   ├── requirements.txt
│   └── run.py
├── frontend/               # React application
│   ├── src/
│   │   ├── components/
│   │   │   ├── Dashboard.tsx
│   │   │   ├── InfrastructureMap.tsx
│   │   │   ├── RiskPanel.tsx
│   │   │   └── ResourceTracker.tsx
│   │   ├── pages/
│   │   ├── App.tsx
│   │   └── index.css
│   ├── package.json
│   └── vite.config.ts
├── docker-compose.yml
└── README.md
```

### Quick Start

**Backend Setup**:
```bash
cd backend
pip install -r requirements.txt
python run.py
```
Backend runs on `http://localhost:8000`

**Frontend Setup**:
```bash
cd frontend
npm install
npm run dev
```
Frontend runs on `http://localhost:5173`

### API Endpoints
- `GET /api/infrastructure` - City infrastructure data
- `GET /api/risks` - Current risk assessments
- `GET /api/resources` - Emergency resources status
- `WS /api/stream` - Real-time data stream

### Key Metrics
- **Casualty Risk Score** (0-100): Estimated impact severity
- **Infrastructure Dependency Index**: Cascading failure probability
- **Response Time Window**: Minutes before critical escalation
- **Resource Constraint Level**: Hospital/ambulance capacity vs. need

### Hackathon Goals
✅ Demonstrate real-time multi-source data integration
✅ Show cascading failure prediction in action
✅ Prove dynamic resource optimization benefits
✅ Showcase human-centric emergency metrics

### Development Notes
- Mock data generator simulates real-world conditions
- Infrastructure interdependencies are hardcoded for demo (hospital→power→substation chains)
- Risk propagation algorithms use simplified graphs (full deployment would use ML)
- Offline-first architecture demonstrated with service workers planned

### Next Steps (Post-Hackathon)
- ML-based failure prediction using historical disaster data
- Real API integrations (weather, seismic, traffic services)
- Graph database for complex interdependency modeling
- Mobile app for field responders
- Blockchain-based resource tracking
- 3D visualization of digital twin
