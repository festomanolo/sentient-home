import { useState, useEffect } from 'react';
import { voiceService } from '@/services/voiceService';
import { weatherService, WeatherData } from '@/services/weatherService';
import { worldClockService, TimeZoneInfo } from '@/services/worldClockService';
import { calendarService, CalendarEvent } from '@/services/calendarService';
import { aiCommandProcessor } from '@/services/aiCommandProcessor';
import { appControlService } from '@/services/appControlService';

export interface AssistantState {
  isListening: boolean;
  isProcessingCommand: boolean;
  lastCommand: string | null;
  weather: WeatherData | null;
  currentTime: TimeZoneInfo;
  upcomingEvents: CalendarEvent[];
  isInitialized: boolean;
}

export const useNoxAssistant = () => {
  const [state, setState] = useState<AssistantState>({
    isListening: false,
    isProcessingCommand: false,
    lastCommand: null,
    weather: null,
    currentTime: worldClockService.getCurrentTime(),
    upcomingEvents: [],
    isInitialized: false
  });

  const [hasSpokenWelcome, setHasSpokenWelcome] = useState(false);

  useEffect(() => {
    initializeAssistant();
    
    // Update time every minute
    const timeInterval = setInterval(() => {
      setState(prev => ({
        ...prev,
        currentTime: worldClockService.getCurrentTime()
      }));
    }, 60000);

    // Update weather every 10 minutes
    const weatherInterval = setInterval(() => {
      updateWeather();
    }, 600000);

    return () => {
      clearInterval(timeInterval);
      clearInterval(weatherInterval);
    };
  }, []);

  const initializeAssistant = async () => {
    try {
      console.log('Initializing NOX AI Assistant...');
      
      // Initialize all services with proper error handling
      const initPromises = [
        updateWeather().catch(error => {
          console.error('Weather initialization failed:', error);
          return null;
        }),
        updateCalendar().catch(error => {
          console.error('Calendar initialization failed:', error);
          return null;
        }),
        calendarService.syncWithDeviceCalendar().catch(error => {
          console.error('Calendar sync failed:', error);
          return null;
        }),
        appControlService.checkInstalledApps().catch(error => {
          console.error('App check failed:', error);
          return null;
        })
      ];

      const results = await Promise.allSettled(initPromises);
      console.log('Service initialization results:', results);

      // Subscribe to voice commands
      voiceService.subscribeToCommands(async (command) => {
        console.log('Voice command received:', command);
        setState(prev => ({
          ...prev,
          lastCommand: command.command,
          isProcessingCommand: true
        }));

        try {
          // Process command with AI
          const intent = await aiCommandProcessor.processCommand(command.command);
          console.log('Command intent:', intent);

          // Check confidence threshold
          if (intent.confidence < 0.6) {
            await voiceService.speak("I'm not sure I understood that. Could you try again?");
            setState(prev => ({ ...prev, isProcessingCommand: false }));
            return;
          }

          // Execute command based on intent
          await executeCommandIntent(intent);
        } catch (error) {
          console.error('Failed to process voice command:', error);
          await voiceService.speak("Sorry, I encountered an error processing that command.");
        } finally {
          setState(prev => ({ ...prev, isProcessingCommand: false }));
        }
      });

      setState(prev => ({
        ...prev,
        isInitialized: true
      }));

      console.log('NOX AI Assistant initialized successfully');

      // Speak welcome message after initialization with context
      if (!hasSpokenWelcome) {
        setTimeout(async () => {
          try {
            // Get current context for a more personalized greeting
            const now = new Date();
            const timeOfDay = now.getHours();
            let contextualGreeting = '';
            
            if (timeOfDay < 12) {
              contextualGreeting = "Good morning, Manolo! ";
            } else if (timeOfDay < 17) {
              contextualGreeting = "Good afternoon, Manolo! ";
            } else if (timeOfDay < 21) {
              contextualGreeting = "Good evening, Manolo! ";
            } else {
              contextualGreeting = "Good night, Manolo! ";
            }

            // Add weather context if available
            if (state.weather) {
              contextualGreeting += `It's ${state.weather.temperature} degrees and ${state.weather.description} outside. `;
            }

            // Add calendar context if available
            if (state.upcomingEvents.length > 0) {
              const nextEvent = state.upcomingEvents[0];
              const timeUntil = Math.round((nextEvent.startTime.getTime() - Date.now()) / (1000 * 60));
              if (timeUntil > 0 && timeUntil < 120) {
                contextualGreeting += `Just a reminder, you have ${nextEvent.title} coming up in ${timeUntil} minutes. `;
              }
            }

            contextualGreeting += "I'm NOX AI, your personal assistant. I'm here and ready to help with weather, calendar, music, apps, and much more!";
            
            console.log('Speaking welcome message:', contextualGreeting);
            await voiceService.speak(contextualGreeting);
            setHasSpokenWelcome(true);
          } catch (speechError) {
            console.error('Failed to speak welcome message:', speechError);
            setHasSpokenWelcome(true); // Set anyway to prevent retries
          }
        }, 2000);
      }

    } catch (error) {
      console.error('Failed to initialize assistant:', error);
      setState(prev => ({
        ...prev,
        isInitialized: true // Set as initialized even if some services failed
      }));
    }
  };

  const updateWeather = async () => {
    try {
      console.log('Updating weather data...');
      const weather = await weatherService.getCurrentWeather();
      setState(prev => ({
        ...prev,
        weather
      }));
      console.log('Weather updated successfully:', weather);
    } catch (error) {
      console.error('Failed to update weather:', error);
      // Don't throw error, just log it
      setState(prev => ({
        ...prev,
        weather: null
      }));
    }
  };

  const updateCalendar = async () => {
    try {
      const events = await calendarService.getUpcomingEvents(24);
      setState(prev => ({
        ...prev,
        upcomingEvents: events
      }));
    } catch (error) {
      console.error('Failed to update calendar:', error);
    }
  };

  const startListening = () => {
    voiceService.startListening();
    setState(prev => ({
      ...prev,
      isListening: true
    }));
  };

  const stopListening = () => {
    voiceService.stopListening();
    setState(prev => ({
      ...prev,
      isListening: false
    }));
  };

  const toggleListening = () => {
    if (state.isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  const executeCommandIntent = async (intent: any) => {
    try {
      switch (intent.action) {
        case 'greeting':
          await voiceService.speak("Hello! How can I help you today?");
          break;

        case 'thanks':
          await voiceService.speak("You're very welcome! Anything else I can help you with?");
          break;

        case 'play_music':
          const playResult = await appControlService.controlApp('lark_player', 'play');
          if (playResult) {
            await voiceService.speak("I've started playing music for you.");
          } else {
            await voiceService.speak("I couldn't start the music. Make sure Lark Player is installed.");
          }
          break;

        case 'pause_music':
          const pauseResult = await appControlService.controlApp('lark_player', 'pause');
          if (pauseResult) {
            await voiceService.speak("Music paused.");
          } else {
            await voiceService.speak("I couldn't pause the music.");
          }
          break;

        case 'next_track':
          const nextResult = await appControlService.controlApp('lark_player', 'next');
          if (nextResult) {
            await voiceService.speak("Skipping to the next track.");
          } else {
            await voiceService.speak("I couldn't skip to the next track.");
          }
          break;

        case 'previous_track':
          const prevResult = await appControlService.controlApp('lark_player', 'previous');
          if (prevResult) {
            await voiceService.speak("Going back to the previous track.");
          } else {
            await voiceService.speak("I couldn't go to the previous track.");
          }
          break;

        case 'volume_up':
          const volUpResult = await appControlService.controlApp('lark_player', 'volume_up');
          if (volUpResult) {
            await voiceService.speak("Volume increased.");
          } else {
            await voiceService.speak("I couldn't adjust the volume.");
          }
          break;

        case 'volume_down':
          const volDownResult = await appControlService.controlApp('lark_player', 'volume_down');
          if (volDownResult) {
            await voiceService.speak("Volume decreased.");
          } else {
            await voiceService.speak("I couldn't adjust the volume.");
          }
          break;

        case 'get_weather':
          try {
            const weather = await weatherService.getCurrentWeather();
            const response = `It's currently ${weather.temperature} degrees and ${weather.description} in ${weather.location}. It feels like ${weather.feelsLike} degrees.`;
            await voiceService.speak(response);
            setState(prev => ({ ...prev, weather }));
          } catch (error) {
            await voiceService.speak("I couldn't get the weather information right now.");
          }
          break;

        case 'get_time':
          const currentTime = worldClockService.getCurrentTime();
          await voiceService.speak(`It's currently ${currentTime.time}.`);
          break;

        case 'get_time_in_location':
          if (intent.entities.location) {
            const timeZone = worldClockService.getTimeInLocation(intent.entities.location);
            if (timeZone) {
              await voiceService.speak(`The time in ${timeZone.city} is ${timeZone.time}.`);
            } else {
              await voiceService.speak(`I couldn't find the time for ${intent.entities.location}.`);
            }
          }
          break;

        case 'get_calendar':
          try {
            const events = await calendarService.getTodaysEvents();
            if (events.length === 0) {
              await voiceService.speak("You have no events scheduled for today.");
            } else {
              const eventList = events.slice(0, 3).map(e => 
                `${e.title} at ${e.startTime.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}`
              ).join(', ');
              await voiceService.speak(`You have ${events.length} events today. ${eventList}.`);
            }
            setState(prev => ({ ...prev, upcomingEvents: events }));
          } catch (error) {
            await voiceService.speak("I couldn't access your calendar right now.");
          }
          break;

        case 'get_next_event':
          try {
            const nextEvent = await calendarService.getNextEvent();
            if (nextEvent) {
              const timeUntil = Math.round((nextEvent.startTime.getTime() - Date.now()) / (1000 * 60));
              await voiceService.speak(`Your next event is ${nextEvent.title} in ${timeUntil} minutes.`);
            } else {
              await voiceService.speak("You have no upcoming events.");
            }
          } catch (error) {
            await voiceService.speak("I couldn't find your next event.");
          }
          break;

        case 'open_app':
          if (intent.entities.app) {
            const appResult = await appControlService.controlApp(intent.entities.app, 'open');
            if (appResult) {
              await voiceService.speak(`Opening ${intent.entities.app}.`);
            } else {
              await voiceService.speak(`I couldn't open ${intent.entities.app}.`);
            }
          }
          break;

        case 'unknown':
          await voiceService.speak("I'm not sure how to help with that. Try asking about weather, time, calendar, or music control.");
          break;

        default:
          await voiceService.speak("I understood your command, but I'm not sure how to execute it yet.");
      }
    } catch (error) {
      console.error('Error executing command:', error);
      await voiceService.speak("Sorry, I encountered an error.");
    }
  };

  const processTextCommand = async (command: string) => {
    setState(prev => ({
      ...prev,
      isProcessingCommand: true,
      lastCommand: command
    }));

    try {
      const intent = await aiCommandProcessor.processCommand(command);
      console.log('Text command intent:', intent);

      if (intent.confidence < 0.6) {
        await voiceService.speak("I'm not sure I understood that. Could you try again?");
        return { success: false, message: "Low confidence" };
      }

      await executeCommandIntent(intent);
      return { success: true, message: "Command executed" };
    } catch (error) {
      console.error('Failed to process command:', error);
      await voiceService.speak("Sorry, I couldn't process that command.");
      return { success: false, message: "Error processing command" };
    } finally {
      setState(prev => ({
        ...prev,
        isProcessingCommand: false
      }));
    }
  };

  const speak = async (text: string, interrupt = false) => {
    await voiceService.speak(text, interrupt);
  };

  const getQuickInfo = () => {
    const info = [];
    
    if (state.weather) {
      info.push(`${state.weather.temperature}°F, ${state.weather.description}`);
    }
    
    if (state.upcomingEvents.length > 0) {
      const nextEvent = state.upcomingEvents[0];
      const timeUntil = Math.round((nextEvent.startTime.getTime() - Date.now()) / (1000 * 60));
      if (timeUntil > 0 && timeUntil < 120) {
        info.push(`${nextEvent.title} in ${timeUntil} minutes`);
      }
    }

    return info;
  };

  const getSystemStatus = () => {
    return {
      voiceEnabled: voiceService.getSettings().voiceResponseEnabled,
      listeningEnabled: voiceService.getSettings().continuousListening,
      weatherLastUpdated: state.weather ? new Date() : null,
      calendarSynced: state.upcomingEvents.length > 0,
      appsConnected: appControlService.getControllableApps().length
    };
  };

  return {
    state,
    startListening,
    stopListening,
    toggleListening,
    processTextCommand,
    speak,
    updateWeather,
    updateCalendar,
    getQuickInfo,
    getSystemStatus
  };
};