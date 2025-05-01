<!-- src/components/dialogs/AddEventDialog.vue -->
<template>
    <form @submit.prevent="submitForm" class="space-y-4">
      <!-- Title -->
      <div class="relative">
        <label class="block text-sm mb-1">Title</label>
        <div class="flex items-center gap-2">
          <input
            v-model="form.title"
            required
            class="flex-1 p-2 rounded bg-[color:var(--color-inputBackground)] text-[color:var(--color-inputText)] border border-[color:var(--color-inputBorder)]"
          />
          <button type="button" @click="form.title = ''" class="text-[color:var(--color-warning)]">🗑</button>
        </div>
      </div>
  
      <!-- Description -->
      <div class="relative">
        <label class="block text-sm mb-1">Description</label>
        <div class="flex items-center gap-2">
          <textarea
            v-model="form.description"
            class="flex-1 p-2 rounded bg-[color:var(--color-inputBackground)] text-[color:var(--color-inputText)] border border-[color:var(--color-inputBorder)]"
          ></textarea>
          <button type="button" @click="form.description = ''" class="text-[color:var(--color-warning)]">🗑</button>
        </div>
      </div>
  
      <!-- Start and End -->
      <div class="space-y-4">
        <!-- Start -->
        <div :class="form.durationValue && form.durationFrom === 'end' ? 'opacity-50 pointer-events-none' : ''">
          <div class="grid grid-cols-2 gap-4">
            <div class="flex items-center gap-2">
              <div class="flex-1">
                <label class="block text-sm mb-1">Start Date</label>
                <input
                  v-model="form.startDate"
                  type="date"
                  @click="handleEditBlockedField('end', $event)"
                  class="w-full p-2 rounded bg-[color:var(--color-inputBackground)] text-[color:var(--color-inputText)] border border-[color:var(--color-inputBorder)]"
                />
              </div>
              <button type="button" @click="form.startDate = ''" class="text-[color:var(--color-warning)]">🗑</button>
            </div>
            <div class="flex items-center gap-2">
              <div class="flex-1">
                <label class="block text-sm mb-1">Start Time</label>
                <input
                  v-model="form.startTime"
                  type="time"
                  @blur="handleStartTimeBlur"
                  @click="handleEditBlockedField('end', $event)"
                  class="w-full p-2 rounded bg-[color:var(--color-inputBackground)] text-[color:var(--color-inputText)] border border-[color:var(--color-inputBorder)]"
                />
              </div>
              <button type="button" @click="form.startTime = ''" class="text-[color:var(--color-warning)]">🗑</button>
            </div>
          </div>
        </div>
  
        <!-- End -->
        <div :class="form.durationValue && form.durationFrom === 'start' ? 'opacity-50 pointer-events-none' : ''">
          <div class="grid grid-cols-2 gap-4">
            <div class="flex items-center gap-2">
              <div class="flex-1">
                <label class="block text-sm mb-1">End Date</label>
                <input
                  v-model="form.endDate"
                  type="date"
                  @click="handleEditBlockedField('start', $event)"
                  class="w-full p-2 rounded bg-[color:var(--color-inputBackground)] text-[color:var(--color-textPrimary)] border border-[color:var(--color-inputBorder)]"
                />
              </div>
              <button type="button" @click="form.endDate = ''" class="text-[color:var(--color-warning)]">🗑</button>
            </div>
            <div class="flex items-center gap-2">
              <div class="flex-1">
                <label class="block text-sm mb-1">End Time</label>
                <input
                  v-model="form.endTime"
                  type="time"
                  @blur="handleEndTimeBlur"
                  @click="handleEditBlockedField('start', $event)"
                  class="w-full p-2 rounded bg-[color:var(--color-inputBackground)] text-[color:var(--color-textPrimary)] border border-[color:var(--color-inputBorder)]"
                />
              </div>
              <button type="button" @click="form.endTime = ''" class="text-[color:var(--color-warning)]">🗑</button>
            </div>
          </div>
        </div>
      </div>
  
      <!-- Duration -->
      <div>
        <label class="block text-sm mb-1">Duration</label>
        <div
          :class="[
            'flex gap-2 items-center',
            form.startDate && form.endDate &&
            !(form.durationValue && form.durationFrom === 'start') &&
            !(form.durationValue && form.durationFrom === 'end')
              ? 'opacity-50 pointer-events-none'
              : ''
          ]"
          @click="handleEditDurationField"
        >
          <input
            v-model.number="form.durationValue"
            type="number"
            min="0"
            class="w-[4.5rem] p-2 rounded bg-[color:var(--color-inputBackground)] text-[color:var(--color-inputText)] border border-[color:var(--color-inputBorder)]"
          />
          <select
            v-model="form.durationUnit"
            class="w-[6rem] p-2 rounded border border-[color:var(--color-inputBorder)] bg-[color:var(--color-inputBackground)]"
            :class="{ 'text-gray-400': !form.durationUnit }"
          >
            <option disabled hidden value="">unit</option>
            <option value="minutes">min</option>
            <option value="hours">hr</option>
            <option value="days">day</option>
            <option value="weeks">wk</option>
          </select>
  
          <select
            v-model="form.durationFrom"
            class="w-[8rem] p-2 rounded border border-[color:var(--color-inputBorder)] bg-[color:var(--color-inputBackground)]"
            :class="{ 'text-gray-400': !form.durationFrom }"
          >
            <option disabled hidden value="">reference</option>
            <option value="start">from start</option>
            <option value="end">before end</option>
          </select>
  
          <button type="button" @click="clearDurationFields" class="text-[color:var(--color-warning)] ml-2">🗑</button>
        </div>
      </div>
  
      <!-- Submit -->
      <div class="flex justify-end">
        <button
          type="submit"
          :disabled="!isFormValid"
          class="px-4 py-1 rounded bg-[color:var(--color-buttonBackground)] text-[color:var(--color-buttonText)] disabled:bg-gray-500 disabled:text-gray-200"
        >
          Save
        </button>
      </div>
    </form>
  </template>
  
  <script setup>
  import { reactive, computed, watch } from 'vue'
  
  const emit = defineEmits(['item-added'])
  
  const form = reactive({
    title: '',
    description: '',
    startDate: '',
    startTime: '00:00',
    endDate: '',
    endTime: '23:59',
    durationValue: null,
    durationUnit: '',
    durationFrom: '',
    _dirtyStartDate: false,
    _dirtyEndDate: false,
    _dirtyStartTime: false,
    _dirtyEndTime: false
  })
  
  function handleStartTimeBlur() {
    form._dirtyStartTime = true
    if (!form._dirtyEndTime && form.startTime && !(form.durationValue && form.durationFrom === 'start')) {
      const [sh, sm] = form.startTime.split(':').map(Number)
      const proposed = new Date(0, 0, 0, sh + 1, sm)
      form.endTime = `${String(Math.min(proposed.getHours(), 23)).padStart(2, '0')}:${String(Math.min(proposed.getMinutes(), 59)).padStart(2, '0')}`
    }
  }
  
  function handleEndTimeBlur() {
    form._dirtyEndTime = true
    if (!form._dirtyStartTime && form.endTime && !(form.durationValue && form.durationFrom === 'end')) {
      const [eh, em] = form.endTime.split(':').map(Number)
      const proposed = new Date(0, 0, 0, eh - 1, em)
      form.startTime = `${String(Math.max(proposed.getHours(), 0)).padStart(2, '0')}:${String(Math.max(proposed.getMinutes(), 0)).padStart(2, '0')}`
    }
  }
  
  function handleEditBlockedField(blockedBy, event) {
    const isBlocked = form.durationValue && form.durationFrom === blockedBy
    if (isBlocked) {
      event.preventDefault()
      event.stopImmediatePropagation()
    }
  }
  
  function handleEditDurationField(event) {
    if (form.startDate && form.endDate) {
      event.preventDefault()
      event.stopImmediatePropagation()
    }
  }
  
  function clearDurationFields() {
    form.durationValue = null
    form.durationUnit = ''
    form.durationFrom = ''
  }
  
  const isFormValid = computed(() => {
    const hasTitle = !!form.title.trim()
    const hasStart = !!form.startDate && !!form.startTime
    const hasEnd = !!form.endDate && !!form.endTime
    const hasDuration = form.durationValue > 0 && !!form.durationUnit && !!form.durationFrom
    const validDurationCombo =
      hasDuration &&
      (
        (form.durationFrom === 'start' && hasStart) ||
        (form.durationFrom === 'end' && hasEnd)
      )
  
    return hasTitle && ((hasStart && hasEnd) || validDurationCombo)
  })
  
  function convertToMinutes(value, unit) {
    const map = { minutes: 1, hours: 60, days: 1440, weeks: 10080 }
    return value * map[unit]
  }
  
  function submitForm() {
    if (!isFormValid.value) return
  
    const body = {
      title: form.title,
      description: form.description,
      date: form.startDate,
      time: form.startTime || null,
      is_all_day: !form.startTime
    }
  
    if (form.durationValue && !(form.startDate && form.endDate)) {
      body.duration_minutes = convertToMinutes(form.durationValue, form.durationUnit)
    } else if (form.startTime && form.endTime) {
      const startDateTime = new Date(`${form.startDate}T${form.startTime}`)
      const endDateTime = new Date(`${form.endDate}T${form.endTime}`)
      body.duration_minutes = Math.floor((endDateTime - startDateTime) / 60000)
    }
  
    emit('item-added', body)
  }
  </script>  