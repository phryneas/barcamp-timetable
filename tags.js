const timeRegex = /^(\d{0,2}):(\d{1,2})$/;

function toMinutes(timeString) {
  const matches = timeString.match(timeRegex);
  return parseInt(matches[1]) * 60 + parseInt(matches[2]);
}

function toTimeString(minutes) {
  return `${Math.floor(minutes / 60)}:${minutes % 60}`;
}

/**
 * @extends HTMLElement
 */
class TimeTable extends HTMLElement {
  async connectedCallback() {
    await window.customElements.whenDefined('x-timeslot');


    Array.from(this.children)
      .filter(child => child instanceof TimeSlot && child.isFiller)
      .forEach(filler => this.removeElement(filler));

    /** @type {TimeSlot[]} */
    const timeSlots = Array.from(this.children).filter(child => child instanceof TimeSlot);

    for (let x = 1; x < timeSlots.length; x++) {
      const last = timeSlots[x - 1];
      const current = timeSlots[x];
      if (toMinutes(last.from) + toMinutes(last.duration) < toMinutes(current.from)) {
        let filler = document.createElement('x-timeslot');
        filler.from = toTimeString(toMinutes(last.from) + toMinutes(last.duration));
        filler.duration = toTimeString(toMinutes(current.from) - toMinutes(filler.from));
        filler.isFiller = true;
        this.insertBefore(filler, current);
      }
    }
  }
}


class TimeSlot extends HTMLElement {
  static get observedAttributes() {
    return ['duration'];
  }

  get from() {
    return this.getAttribute('from');
  }

  set from(newValue) {
    this.setAttribute('from', newValue);
  }

  get duration() {
    return this.getAttribute('duration');
  }

  set duration(newValue) {
    this.setAttribute('duration', newValue);
  }

  get isFiller() {
    return this.hasAttribute('isFiller');
  }

  set isFiller(newValue) {
    if (newValue) {
      this.setAttribute('isFiller', true);
    } else {
      this.removeAttribute('isFiller');
    }
  }

  attributeChangedCallback(name, oldValue, newValue) {
    switch (name) {
      case 'duration':
        const minutes = toMinutes(newValue);
        this.style.flex = `${minutes} 0 ${minutes}px`;
    }
  }
}

customElements.define('x-timeslot', TimeSlot);
customElements.define('x-timetable', TimeTable);
