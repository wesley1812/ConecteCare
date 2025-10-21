import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import {Layout} from "../components/Layout";
import {CardIndicadorSaude} from "../components/CardSaude";
import {CardConsulta} from "../components/CardSaude";
import type { Patient, HealthIndicatorType, AppointmentType } from "../types/interfaces";


export function MenuCuidador() {
  const { id } = useParams<{ id: string }>();

  const [patient, setPatient] = useState<Patient | null>(null);
  const [healthIndicators, setHealthIndicators] = useState<HealthIndicatorType[]>([]);
  const [appointments, setAppointments] = useState<AppointmentType[]>([]);

  useEffect(() => {
    const patientData: Patient = {
      id: id || "1",
      name: "João da Silva",
      age: 75,
      medicalHistory: "Hipertensão e diabetes controlada."
    };

    const healthData: HealthIndicatorType[] = [
      {
        name: "Pressão Arterial",
        value: "120/80 mmHg",
        percentage: 80,
        color: "#2e7d32"
      },
      {
        name: "Glicemia", 
        value: "140 mg/dL",
        percentage: 60,
        color: "#f9a825"
      },
      {
        name: "Hidratação",
        value: "Baixa ingestão",
        percentage: 40,
        color: "#c62828"
      }
    ];

    const appointmentData: AppointmentType[] = [
      {
        id: 1,
        type: "Consulta de fisioterapia",
        date: "20/06/2025",
        time: "14h00"
      },
      {
        id: 2,
        type: "Consulta de Psicologia",
        date: "25/05/2025", 
        time: "10h30"
      }
    ];

    setPatient(patientData);
    setHealthIndicators(healthData);
    setAppointments(appointmentData);
  }, [id]);

  const handleContactDoctor = (appointmentId: number) => {
    alert(`Entrando em contato sobre a consulta ID: ${appointmentId}`);
  };

  if (!patient) {
    return (
      <Layout>
        <div className="py-12 bg-gray-50 min-h-screen">
          <div className="text-center">Carregando...</div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="py-12 bg-gray-50 min-h-screen">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <section className="bg-white p-6 rounded-lg shadow-md mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Informações do Paciente (ID: {patient.id})
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <p className="text-gray-700">
                <strong>Nome:</strong> {patient.name}
              </p>
              <p className="text-gray-700">
                <strong>Idade:</strong> {patient.age} anos
              </p>
              <p className="text-gray-700">
                <strong>Histórico Médico:</strong> {patient.medicalHistory}
              </p>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Evolução da Saúde</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {healthIndicators.map((indicator, index) => (
                <CardIndicadorSaude 
                  key={index} 
                  indicador={indicator} 
                />
              ))}
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Próximas Consultas</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {appointments.map((appointment) => (
                <CardConsulta
                  key={appointment.id}
                  appointment={appointment}
                  onContact={handleContactDoctor}
                />
              ))}
            </div>
          </section>
        </div>
      </div>
    </Layout>
  );
};
