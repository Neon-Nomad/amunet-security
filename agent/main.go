package main

import (
	"bytes"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"
)

type AgentConfig struct {
	ControlPlaneURL string
	Hostname        string
	IPAddress       string
	OSType          string
}

type AgentRegistration struct {
	Hostname  string `json:"hostname"`
	OSType    string `json:"os_type"`
	IPAddress string `json:"ip_address"`
}

type AgentResponse struct {
	ID     string `json:"id"`
	Status string `json:"status"`
}

func main() {
	fmt.Println("Amunet Agent Starting...")

	config := AgentConfig{
		ControlPlaneURL: getEnv("CONTROL_PLANE_URL", "http://control-plane:8000"),
		Hostname:        getEnv("HOSTNAME", "agent-01"),
		IPAddress:       getEnv("IP_ADDRESS", "127.0.0.1"),
		OSType:          "linux", // TODO: Detect OS
	}

	// Register Agent
	agentID, err := registerAgent(config)
	if err != nil {
		log.Printf("Failed to register agent: %v", err)
		// Continue anyway for now, maybe retry later
	} else {
		log.Printf("Agent registered successfully. ID: %s", agentID)
	}

	// Handle graceful shutdown
	c := make(chan os.Signal, 1)
	signal.Notify(c, os.Interrupt, syscall.SIGTERM)

	go func() {
		<-c
		fmt.Println("\nShutting down agent...")
		os.Exit(0)
	}()

	// Simulate agent loop
	ticker := time.NewTicker(5 * time.Second)
	defer ticker.Stop()

	for range ticker.C {
		log.Printf("Agent heartbeat (ID: %s): System secure", agentID)
		// TODO: Implement NATS connection and telemetry reporting
	}
}

func registerAgent(config AgentConfig) (string, error) {
	payload := AgentRegistration{
		Hostname:  config.Hostname,
		OSType:    config.OSType,
		IPAddress: config.IPAddress,
	}

	jsonData, err := json.Marshal(payload)
	if err != nil {
		return "", err
	}

	url := fmt.Sprintf("%s/api/v1/agents/register", config.ControlPlaneURL)
	resp, err := http.Post(url, "application/json", bytes.NewBuffer(jsonData))
	if err != nil {
		return "", err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return "", fmt.Errorf("registration failed with status: %d", resp.StatusCode)
	}

	var response AgentResponse
	if err := json.NewDecoder(resp.Body).Decode(&response); err != nil {
		return "", err
	}

	return response.ID, nil
}

func getEnv(key, fallback string) string {
	if value, ok := os.LookupEnv(key); ok {
		return value
	}
	return fallback
}
