// Sistema de Calendario Interactivo
class EventCalendar {
    constructor(containerId, options = {}) {
        this.container = document.getElementById(containerId);
        this.currentDate = new Date();
        this.selectedDate = null;
        this.events = [];
        this.options = {
            locale: 'es-ES',
            firstDayOfWeek: 1, // Lunes
            showWeekNumbers: false,
            allowMultipleSelection: false,
            theme: 'mcm',
            ...options
        };
        
        this.monthNames = [
            'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
            'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
        ];
        
        this.dayNames = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
        this.init();
    }

    init() {
        this.loadDefaultEvents();
        this.render();
        this.attachEventListeners();
        console.log('Event Calendar initialized');
    }

    // Cargar eventos predeterminados
    loadDefaultEvents() {
        const today = new Date();
        const nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
        const nextMonth = new Date(today.getFullYear(), today.getMonth() + 1, 15);

        this.events = [
            {
                id: 1,
                title: 'Culto Dominical',
                description: 'Servicio dominical de alabanza y predicación',
                date: new Date(today.getFullYear(), today.getMonth(), today.getDate() + (7 - today.getDay())),
                time: '09:00',
                duration: 120,
                type: 'culto',
                recurring: 'weekly',
                location: 'Templo Principal',
                pastor: 'Pastora Mary Penagos'
            },
            {
                id: 2,
                title: 'Reunión de Células',
                description: 'Grupos pequeños de estudio bíblico y oración',
                date: new Date(today.getFullYear(), today.getMonth(), today.getDate() + ((3 - today.getDay() + 7) % 7)),
                time: '19:30',
                duration: 90,
                type: 'celula',
                recurring: 'weekly',
                location: 'Hogares'
            },
            {
                id: 3,
                title: 'Culto de Viernes',
                description: 'Servicio nocturno de oración y adoración',
                date: new Date(today.getFullYear(), today.getMonth(), today.getDate() + ((5 - today.getDay() + 7) % 7)),
                time: '19:30',
                duration: 120,
                type: 'culto',
                recurring: 'weekly',
                location: 'Templo Principal',
                pastor: 'Pastora Mary Penagos'
            },
            {
                id: 4,
                title: 'Retiro Espiritual',
                description: 'Fin de semana de renovación espiritual',
                date: nextMonth,
                time: '08:00',
                duration: 1440, // Todo el día
                type: 'especial',
                location: 'Centro de Retiros',
                cost: 'Donación voluntaria'
            },
            {
                id: 5,
                title: 'Conferencia Juvenil',
                description: 'Evento especial para jóvenes',
                date: new Date(today.getFullYear(), today.getMonth() + 1, 20),
                time: '18:00',
                duration: 180,
                type: 'juventud',
                location: 'Salón de Jóvenes',
                ageRange: '15-30 años'
            }
        ];
    }

    // Renderizar el calendario completo
    render() {
        if (!this.container) return;

        this.container.innerHTML = `
            <div class="calendar-wrapper">
                <div class="calendar-header">
                    <div class="calendar-nav">
                        <button class="nav-btn" id="prevMonth" aria-label="Mes anterior">
                            <i class="fas fa-chevron-left"></i>
                        </button>
                        <h3 class="current-month" id="currentMonth">
                            ${this.monthNames[this.currentDate.getMonth()]} ${this.currentDate.getFullYear()}
                        </h3>
                        <button class="nav-btn" id="nextMonth" aria-label="Mes siguiente">
                            <i class="fas fa-chevron-right"></i>
                        </button>
                    </div>
                    <div class="calendar-actions">
                        <button class="btn btn-secondary btn-sm" id="todayBtn">Hoy</button>
                        <button class="btn btn-primary btn-sm" id="addEventBtn">
                            <i class="fas fa-plus"></i> Evento
                        </button>
                    </div>
                </div>
                
                <div class="calendar-grid">
                    <div class="calendar-weekdays">
                        ${this.dayNames.map(day => `<div class="weekday">${day}</div>`).join('')}
                    </div>
                    <div class="calendar-days" id="calendarDays">
                        ${this.renderDays()}
                    </div>
                </div>
                
                <div class="calendar-sidebar">
                    <div class="events-section">
                        <h4>Próximos Eventos</h4>
                        <div class="upcoming-events" id="upcomingEvents">
                            ${this.renderUpcomingEvents()}
                        </div>
                    </div>
                    
                    <div class="legend-section">
                        <h4>Tipos de Eventos</h4>
                        <div class="event-legend">
                            <div class="legend-item">
                                <span class="legend-color culto"></span>
                                <span>Cultos</span>
                            </div>
                            <div class="legend-item">
                                <span class="legend-color celula"></span>
                                <span>Células</span>
                            </div>
                            <div class="legend-item">
                                <span class="legend-color especial"></span>
                                <span>Eventos Especiales</span>
                            </div>
                            <div class="legend-item">
                                <span class="legend-color juventud"></span>
                                <span>Juventud</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
            <!-- Modal para detalles del evento -->
            <div class="modal" id="eventModal" style="display: none;">
                <div class="modal-content">
                    <div class="modal-header">
                        <h3 id="modalTitle">Detalles del Evento</h3>
                        <button class="close-btn" id="closeModal">&times;</button>
                    </div>
                    <div class="modal-body" id="modalBody">
                        <!-- Contenido dinámico -->
                    </div>
                </div>
            </div>
        `;

        this.attachEventListeners();
    }

    // Renderizar días del mes
    renderDays() {
        const year = this.currentDate.getFullYear();
        const month = this.currentDate.getMonth();
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const startDate = new Date(firstDay);
        
        // Ajustar al primer día de la semana
        const dayOfWeek = (firstDay.getDay() - this.options.firstDayOfWeek + 7) % 7;
        startDate.setDate(startDate.getDate() - dayOfWeek);
        
        let html = '';
        const today = new Date();
        
        for (let week = 0; week < 6; week++) {
            for (let day = 0; day < 7; day++) {
                const date = new Date(startDate);
                date.setDate(startDate.getDate() + (week * 7) + day);
                
                const isCurrentMonth = date.getMonth() === month;
                const isToday = this.isSameDay(date, today);
                const isSelected = this.selectedDate && this.isSameDay(date, this.selectedDate);
                const dayEvents = this.getEventsForDate(date);
                
                const classes = [
                    'calendar-day',
                    !isCurrentMonth && 'other-month',
                    isToday && 'today',
                    isSelected && 'selected',
                    dayEvents.length > 0 && 'has-events'
                ].filter(Boolean).join(' ');
                
                html += `
                    <div class="${classes}" data-date="${date.toISOString()}">
                        <span class="day-number">${date.getDate()}</span>
                        ${dayEvents.length > 0 ? `
                            <div class="day-events">
                                ${dayEvents.slice(0, 3).map(event => `
                                    <div class="event-dot ${event.type}" title="${event.title}"></div>
                                `).join('')}
                                ${dayEvents.length > 3 ? `<div class="more-events">+${dayEvents.length - 3}</div>` : ''}
                            </div>
                        ` : ''}
                    </div>
                `;
            }
        }
        
        return html;
    }

    // Renderizar próximos eventos
    renderUpcomingEvents() {
        const today = new Date();
        const nextEvents = this.events
            .filter(event => event.date >= today)
            .sort((a, b) => a.date - b.date)
            .slice(0, 5);

        if (nextEvents.length === 0) {
            return '<p class="no-events">No hay eventos próximos</p>';
        }

        return nextEvents.map(event => `
            <div class="upcoming-event ${event.type}" data-event-id="${event.id}">
                <div class="event-date">
                    <span class="month">${this.monthNames[event.date.getMonth()].substring(0, 3)}</span>
                    <span class="day">${event.date.getDate()}</span>
                </div>
                <div class="event-info">
                    <h5>${event.title}</h5>
                    <p class="event-time">
                        <i class="fas fa-clock"></i> 
                        ${event.time} ${event.duration ? `(${Math.floor(event.duration / 60)}h ${event.duration % 60}m)` : ''}
                    </p>
                    ${event.location ? `
                        <p class="event-location">
                            <i class="fas fa-map-marker-alt"></i> 
                            ${event.location}
                        </p>
                    ` : ''}
                </div>
            </div>
        `).join('');
    }

    // Obtener eventos para una fecha específica
    getEventsForDate(date) {
        return this.events.filter(event => {
            if (this.isSameDay(event.date, date)) {
                return true;
            }
            
            // Manejar eventos recurrentes
            if (event.recurring === 'weekly') {
                const dayDiff = Math.abs(date - event.date) / (1000 * 60 * 60 * 24);
                return dayDiff % 7 === 0 && date >= event.date;
            }
            
            return false;
        });
    }

    // Verificar si dos fechas son el mismo día
    isSameDay(date1, date2) {
        return date1.getDate() === date2.getDate() &&
               date1.getMonth() === date2.getMonth() &&
               date1.getFullYear() === date2.getFullYear();
    }

    // Adjuntar event listeners
    attachEventListeners() {
        // Navegación del calendario
        document.getElementById('prevMonth')?.addEventListener('click', () => {
            this.currentDate.setMonth(this.currentDate.getMonth() - 1);
            this.updateCalendar();
        });

        document.getElementById('nextMonth')?.addEventListener('click', () => {
            this.currentDate.setMonth(this.currentDate.getMonth() + 1);
            this.updateCalendar();
        });

        document.getElementById('todayBtn')?.addEventListener('click', () => {
            this.currentDate = new Date();
            this.selectedDate = new Date();
            this.updateCalendar();
        });

        // Clicks en días del calendario
        this.container.addEventListener('click', (e) => {
            const dayElement = e.target.closest('.calendar-day');
            if (dayElement) {
                const dateStr = dayElement.dataset.date;
                if (dateStr) {
                    this.selectedDate = new Date(dateStr);
                    this.showDayEvents(this.selectedDate);
                    this.updateCalendar();
                }
            }

            // Clicks en eventos próximos
            const eventElement = e.target.closest('.upcoming-event');
            if (eventElement) {
                const eventId = parseInt(eventElement.dataset.eventId);
                const event = this.events.find(e => e.id === eventId);
                if (event) {
                    this.showEventDetails(event);
                }
            }
        });

        // Modal
        document.getElementById('closeModal')?.addEventListener('click', () => {
            this.hideModal();
        });

        // Cerrar modal al hacer click fuera
        document.getElementById('eventModal')?.addEventListener('click', (e) => {
            if (e.target.id === 'eventModal') {
                this.hideModal();
            }
        });
    }

    // Actualizar calendario
    updateCalendar() {
        document.getElementById('currentMonth').textContent = 
            `${this.monthNames[this.currentDate.getMonth()]} ${this.currentDate.getFullYear()}`;
        document.getElementById('calendarDays').innerHTML = this.renderDays();
        document.getElementById('upcomingEvents').innerHTML = this.renderUpcomingEvents();
    }

    // Mostrar eventos del día
    showDayEvents(date) {
        const events = this.getEventsForDate(date);
        if (events.length === 0) {
            this.showNotification('No hay eventos para esta fecha');
            return;
        }

        if (events.length === 1) {
            this.showEventDetails(events[0]);
        } else {
            this.showMultipleEvents(date, events);
        }
    }

    // Mostrar detalles de un evento
    showEventDetails(event) {
        const modalBody = document.getElementById('modalBody');
        const formatDate = (date) => {
            return date.toLocaleDateString('es-ES', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
        };

        modalBody.innerHTML = `
            <div class="event-details">
                <div class="event-header ${event.type}">
                    <h4>${event.title}</h4>
                    <span class="event-type">${this.getEventTypeLabel(event.type)}</span>
                </div>
                
                <div class="event-info-grid">
                    <div class="info-item">
                        <i class="fas fa-calendar"></i>
                        <div>
                            <strong>Fecha</strong>
                            <p>${formatDate(event.date)}</p>
                        </div>
                    </div>
                    
                    <div class="info-item">
                        <i class="fas fa-clock"></i>
                        <div>
                            <strong>Hora</strong>
                            <p>${event.time} ${event.duration ? `(${Math.floor(event.duration / 60)}h ${event.duration % 60}m)` : ''}</p>
                        </div>
                    </div>
                    
                    ${event.location ? `
                        <div class="info-item">
                            <i class="fas fa-map-marker-alt"></i>
                            <div>
                                <strong>Ubicación</strong>
                                <p>${event.location}</p>
                            </div>
                        </div>
                    ` : ''}
                    
                    ${event.pastor ? `
                        <div class="info-item">
                            <i class="fas fa-user"></i>
                            <div>
                                <strong>Pastor/a</strong>
                                <p>${event.pastor}</p>
                            </div>
                        </div>
                    ` : ''}
                    
                    ${event.cost ? `
                        <div class="info-item">
                            <i class="fas fa-tag"></i>
                            <div>
                                <strong>Costo</strong>
                                <p>${event.cost}</p>
                            </div>
                        </div>
                    ` : ''}
                    
                    ${event.ageRange ? `
                        <div class="info-item">
                            <i class="fas fa-users"></i>
                            <div>
                                <strong>Edad</strong>
                                <p>${event.ageRange}</p>
                            </div>
                        </div>
                    ` : ''}
                </div>
                
                <div class="event-description">
                    <h5>Descripción</h5>
                    <p>${event.description}</p>
                </div>
                
                ${event.recurring ? `
                    <div class="event-recurring">
                        <i class="fas fa-redo"></i>
                        <span>Evento recurrente (${event.recurring === 'weekly' ? 'semanal' : event.recurring})</span>
                    </div>
                ` : ''}
                
                <div class="event-actions">
                    <button class="btn btn-primary" onclick="calendar.addToCalendar(${event.id})">
                        <i class="fas fa-calendar-plus"></i> Agregar a mi calendario
                    </button>
                    <button class="btn btn-secondary" onclick="calendar.shareEvent(${event.id})">
                        <i class="fas fa-share"></i> Compartir
                    </button>
                </div>
            </div>
        `;

        this.showModal();
    }

    // Mostrar múltiples eventos
    showMultipleEvents(date, events) {
        const modalBody = document.getElementById('modalBody');
        const formatDate = (date) => {
            return date.toLocaleDateString('es-ES', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
        };

        modalBody.innerHTML = `
            <div class="multiple-events">
                <h4>Eventos del ${formatDate(date)}</h4>
                <div class="events-list">
                    ${events.map(event => `
                        <div class="event-item ${event.type}" onclick="calendar.showEventDetails(${JSON.stringify(event).replace(/"/g, '&quot;')})">
                            <div class="event-time">${event.time}</div>
                            <div class="event-info">
                                <h5>${event.title}</h5>
                                <p>${event.description}</p>
                                ${event.location ? `<span class="location"><i class="fas fa-map-marker-alt"></i> ${event.location}</span>` : ''}
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;

        this.showModal();
    }

    // Obtener etiqueta del tipo de evento
    getEventTypeLabel(type) {
        const labels = {
            culto: 'Culto',
            celula: 'Célula',
            especial: 'Evento Especial',
            juventud: 'Juventud',
            infantil: 'Niños',
            capacitacion: 'Capacitación'
        };
        return labels[type] || 'Evento';
    }

    // Mostrar modal
    showModal() {
        document.getElementById('eventModal').style.display = 'flex';
        document.body.style.overflow = 'hidden';
    }

    // Ocultar modal
    hideModal() {
        document.getElementById('eventModal').style.display = 'none';
        document.body.style.overflow = 'auto';
    }

    // Agregar evento al calendario del dispositivo
    addToCalendar(eventId) {
        const event = this.events.find(e => e.id === eventId);
        if (!event) return;

        const startDate = new Date(event.date);
        const [hours, minutes] = event.time.split(':');
        startDate.setHours(parseInt(hours), parseInt(minutes));
        
        const endDate = new Date(startDate.getTime() + (event.duration || 60) * 60000);

        const calendarEvent = {
            title: event.title,
            start: startDate.toISOString().replace(/[:-]/g, '').replace(/\.\d{3}/, ''),
            end: endDate.toISOString().replace(/[:-]/g, '').replace(/\.\d{3}/, ''),
            description: event.description,
            location: event.location || ''
        };

        // Crear URL para Google Calendar
        const googleUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(calendarEvent.title)}&dates=${calendarEvent.start}/${calendarEvent.end}&details=${encodeURIComponent(calendarEvent.description)}&location=${encodeURIComponent(calendarEvent.location)}`;
        
        window.open(googleUrl, '_blank');
    }

    // Compartir evento
    shareEvent(eventId) {
        const event = this.events.find(e => e.id === eventId);
        if (!event) return;

        const shareText = `${event.title}\n${event.description}\n📅 ${event.date.toLocaleDateString('es-ES')} a las ${event.time}\n📍 ${event.location || 'MCM Buga'}`;

        if (navigator.share) {
            navigator.share({
                title: event.title,
                text: shareText,
                url: window.location.href
            });
        } else {
            // Fallback: copiar al portapapeles
            navigator.clipboard.writeText(shareText).then(() => {
                this.showNotification('Evento copiado al portapapeles');
            });
        }
    }

    // Mostrar notificación
    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: var(--primary);
            color: white;
            padding: 1rem;
            border-radius: 8px;
            box-shadow: var(--shadow-lg);
            z-index: 10000;
            animation: slideIn 0.3s ease;
        `;

        document.body.appendChild(notification);

        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease forwards';
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }

    // API pública para agregar eventos
    addEvent(eventData) {
        const event = {
            id: Date.now(),
            ...eventData,
            date: new Date(eventData.date)
        };
        this.events.push(event);
        this.updateCalendar();
        return event.id;
    }

    // API pública para obtener eventos
    getEvents(startDate, endDate) {
        return this.events.filter(event => {
            const eventDate = event.date;
            return eventDate >= startDate && eventDate <= endDate;
        });
    }
}

// Estilos CSS para el calendario (se agregará dinámicamente)
const calendarStyles = `
<style>
@keyframes slideIn {
    from { transform: translateX(100%); opacity: 0; }
    to { transform: translateX(0); opacity: 1; }
}

@keyframes slideOut {
    from { transform: translateX(0); opacity: 1; }
    to { transform: translateX(100%); opacity: 0; }
}
</style>
`;

document.head.insertAdjacentHTML('beforeend', calendarStyles);

// Exponer para uso global
window.EventCalendar = EventCalendar;