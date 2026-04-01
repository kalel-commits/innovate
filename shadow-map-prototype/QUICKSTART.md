# SHADOW MAP - Quick Start Guide

## Prerequisites
- Python 3.9+
- Node.js 16+
- npm or yarn

## Option 1: Direct Local Setup (Recommended for Hackathon)

### Backend Setup
```bash
cd backend
pip install -r requirements.txt
python run.py
```
Backend will be running at: **http://localhost:8000**

API Docs available at: **http://localhost:8000/docs**

### Frontend Setup (in a new terminal)
```bash
cd frontend
npm install
npm run dev
```
Frontend will be running at: **http://localhost:5173**

## Option 2: Docker Setup

```bash
docker-compose up
```
- Backend: http://localhost:8000
- Frontend: http://localhost:5173

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/infrastructure` | GET | City infrastructure status |
| `/api/risks` | GET | Current risk assessments |
| `/api/resources` | GET | Emergency resources |
| `/api/dashboard` | GET | Dashboard summary |
| `/ws/stream` | WebSocket | Real-time data stream |

### Example Request:
```bash
curl http://localhost:8000/api/dashboard
```

## Dashboard Features

### Real-time Metrics
- **Risk Score**: System-wide disaster risk (0-100)
- **Critical Infrastructure**: Count of at-risk assets
- **Affected Population**: Estimated impact size
- **Ambulances**: Available emergency units
- **Hospital Beds**: Available capacity
- **Active Incidents**: Critical events needing response

### Environmental Monitoring
- Rainfall intensity
- River/flood levels
- Wind velocity
- Grid voltage fluctuations
- Traffic congestion
- Social media panic index

### Risk Zones
- Top 5 highest-risk infrastructures
- Risk scores with population impact
- Visual risk indicators

### Recommendations
- Strategic action items
- Resource deployment suggestions
- Evacuation triggers
- Emergency protocol recommendations

## Demo Data

The system uses **simulated data** to demonstrate:
- Environmental stress propagation
- Cascading infrastructure failures
- Resource constraint scenarios
- Dynamic priority scoring
- Real-time metric updates

## Architecture

### Backend (FastAPI)
- **Async WebSocket streaming** for real-time updates
- **Risk assessment engine** with cascading failure models
- **Data simulator** generating realistic environmental scenarios
- **Resource tracking** for ambulances, hospital beds, oxygen
- **Priority scoring** for rescue operations

### Frontend (React + TypeScript)
- **Real-time dashboard** updates every 5 seconds
- **WebSocket connection** for continuous data streams
- **Status cards** showing critical metrics
- **Risk visualization** with color-coded severity
- **Responsive design** for mobile/tablet viewing

## Key Hackathon Features

✅ **Multi-source data integration** (rainfall, seismic, grid, traffic, social)
✅ **Digital twin modeling** (infrastructure interdependencies)
✅ **Cascading failure prediction** (hospital→power→substation chains)
✅ **Real-time risk scoring** (0-100 casualty risk metric)  
✅ **Resource optimization** (dynamic ambulance/bed allocation)
✅ **Human-centric metrics** (affected population, vulnerable demographics)
✅ **Strategic recommendations** (evacuation, shelter, resource deployment)
✅ **Live command dashboard** (one-screen emergency overview)

## Next Steps

### For Judges:
1. Start backend: `python run.py` (backend folder)
2. Start frontend: `npm run dev` (frontend folder)
3. Open http://localhost:5173 in browser
4. Watch real-time updates every 5 seconds
5. Note the color-coded risk zones and recommendations

### For Development:
- Add real data sources (OpenWeather API, USGS seismic data)
- Implement ML prediction models for failure forecasting
- Add mobile app for field responders
- Create 3D visualization of digital twin
- Implement voice alerts and SMS notifications
- Add blockchain for decentralized resource tracking

## Project Layout
```
shadow-map-prototype/
├── backend/
│   ├── app/
│   │   ├── main.py (FastAPI app)
│   │   ├── models.py (Data models)
│   │   ├── data_simulator.py (Risk engine & data gen)
│   │   └── routes.py (API endpoints)
│   ├── requirements.txt
│   ├── run.py
│   └── Dockerfile
├── frontend/
│   ├── src/
│   │   ├── components/Dashboard.tsx
│   │   ├── App.tsx
│   │   └── styles
│   ├── package.json
│   ├── vite.config.ts
│   └── Dockerfile
├── docker-compose.yml
└── README.md
```

## Support
For issues or questions, check the API documentation at `/docs` or review the console logs in browser DevTools.

**Demo Version**: This prototype uses simulated data. Production deployment would integrate real APIs and historical disaster data for accurate predictions.
