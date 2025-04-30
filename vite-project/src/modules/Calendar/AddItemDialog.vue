<template>
    <dialog
      ref="dialogRef"
      class="rounded-xl p-6 bg-[color:var(--color-surface)] text-[color:var(--color-textPrimary)] shadow-xl w-[500px] max-w-full"
    >
      <form @submit.prevent="submitForm" class="space-y-4">
        <div class="text-lg font-bold">Add New {{ formTypeLabel }}</div>
  
        <!-- Type Selector -->
        <div class="relative">
          <label class="block text-sm mb-1">Type</label>
          <select
            v-model="formType"
            class="w-full p-2 pr-10 rounded bg-[color:var(--color-inputBackground)] text-[color:var(--color-inputText)] border border-[color:var(--color-inputBorder)]"
          >
            <option value="event">Event</option>
            <option value="task">Task</option>
          </select>
        </div>
  
        <!-- Title -->
        <div class="relative">
          <label class="block text-sm mb-1">Title</label>
          <div class="flex items-center gap-2">
            <input
              v-model="form.title"
              required
              class="flex-1 p-2 rounded bg-[color:var(--color-inputBackground)] text-[color:var(--color-inputText)] border border-[color:var(--color-inputBorder)]"
            />
            <button
              type="button"
              @click="form.title = ''"
              class="text-[color:var(--color-warning)]"
            >🗑</button>
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
            <button
              type="button"
              @click="form.description = ''"
              class="text-[color:var(--color-warning)]"
            >🗑</button>
          </div>
        </div>
  
        <!-- Time Fields -->
        <div class="space-y-4">
          <!-- Start Section -->
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
  
          <!-- End Section -->
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
  
        <!-- Duration Section -->
        <div class="relative">
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
  
            <button
              type="button"
              @click="clearDurationFields"
              class="text-[color:var(--color-warning)] ml-2"
            >🗑</button>
          </div>
        </div>
  
        <!-- Buttons -->
        <div class="flex justify-end gap-2 pt-4">
          <div class="relative group">
            <button
              type="submit"
              :disabled="!isFormValid"
              class="px-4 py-1 rounded transition-colors
                     bg-[color:var(--color-buttonBackground)]
                     text-[color:var(--color-buttonText)]
                     disabled:bg-gray-500 disabled:text-gray-200
                     disabled:cursor-not-allowed"
            >
              Save
            </button>
  
            <div
              v-if="!isFormValid"
              class="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 w-[240px]
                     px-3 py-2 rounded shadow text-sm text-white
                     bg-gray-800 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"
            >
              event requires at least a title AND:<br />
              • start & end date/time<br />
              OR<br />
              • one date/time & duration
              <div class="absolute top-full left-1/2 -translate-x-1/2 w-3 h-3 bg-gray-800 rotate-45"></div>
            </div>
          </div>
  
          <button
            type="button"
            @click="handleCancel"
            class="px-4 py-1 rounded border border-[color:var(--color-borderLight)]"
          >
            Cancel
          </button>
        </div>
      </form>
    </dialog>
  </template>  
  
  <script setup>
  import { ref, reactive, computed, watch } from 'vue'

  let suppressFieldDirtying = false
  let suppressDirtyFlagFromDurationUpdate = false

  const emit = defineEmits(['item-added'])
  const dialogRef = ref(null)
  const formType = ref('event')
  
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



function resetForm() {
  form.title = ''
  form.description = ''
  form.startDate = ''
  form.startTime = '00:00'
  form.endDate = ''
  form.endTime = '23:59'
  form.durationValue = null
  form.durationUnit = ''
  form.durationFrom = ''
  form._dirtyStartDate = false
  form._dirtyEndDate = false
  form._dirtyStartTime = false
  form._dirtyEndTime = false
}


const isFormDirty = computed(() =>
  form.title ||
  form.description ||
  form.startDate ||
  form.startTime !== '00:00' ||
  form.endDate ||
  form.endTime !== '23:59' ||
  form.durationValue !== null ||
  form.durationUnit ||
  form.durationFrom
)


function handleCancel() {
  if (isFormDirty.value) {
    const confirmed = confirm('Discard your changes?')
    if (!confirmed) return
  }

  resetForm()
  dialogRef.value?.close()
}

const isFormValid = computed(() => {
  const hasTitle = !!form.title.trim()

  const hasStart = !!form.startDate && !!form.startTime
  const hasEnd = !!form.endDate && !!form.endTime

  const hasDuration =
    form.durationValue > 0 &&
    !!form.durationUnit &&
    !!form.durationFrom

  const oneDatePresent = !!form.startDate || !!form.endDate

  const validDurationCombo =
    hasDuration &&
    (
      (form.durationFrom === 'start' && hasStart) ||
      (form.durationFrom === 'end' && hasEnd)
    )

  return hasTitle && (
    (hasStart && hasEnd) || validDurationCombo
  )
})


function handleStartTimeBlur() {
  form._dirtyStartTime = true

  const endTimeNotGreyed = !(form.durationValue && form.durationFrom === 'start')

  if (!form._dirtyEndTime && endTimeNotGreyed && form.startTime) {
    const [sh, sm] = form.startTime.split(':').map(Number)
    const proposed = new Date(0, 0, 0, sh + 1, sm)

    const hours = Math.min(proposed.getHours(), 23)
    const minutes = Math.min(proposed.getMinutes(), 59)

    form.endTime = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`
  }
}

function handleEndTimeBlur() {
  form._dirtyEndTime = true

  const startTimeNotGreyed = !(form.durationValue && form.durationFrom === 'end')

  if (!form._dirtyStartTime && startTimeNotGreyed && form.endTime) {
    const [eh, em] = form.endTime.split(':').map(Number)
    const proposed = new Date(0, 0, 0, eh - 1, em)

    const hours = Math.max(proposed.getHours(), 0)
    const minutes = Math.max(proposed.getMinutes(), 0)

    form.startTime = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`
  }
}

watch(
  () => [form.durationValue, form.durationUnit, form.durationFrom],
  ([newVal, newUnit, from]) => {
    if (!newVal || newVal <= 0 || !newUnit || !from) return

    const minutes = convertToMinutes(newVal, newUnit)

    // 🔴 Temporarily removed start/end auto-updating logic
    // We want to avoid triggering reactive watchers during auto-updates
    // TODO: Re-implement start/end date+time auto field updates based on duration when conditions are cleanly handled
  }
)

  
  const formTypeLabel = computed(() => formType.value === 'event' ? 'Event' : 'Task')

  watch(() => form.startDate, (newVal, oldVal) => {
  if (newVal !== oldVal && newVal !== '') {
    if (suppressDirtyFlagFromDurationUpdate) return
    form._dirtyStartDate = true
    const endIsNotGreyedOut = !(form.durationValue && form.durationFrom === 'start')
    if (!form._dirtyEndDate && !form.endDate && endIsNotGreyedOut) {
      form.endDate = newVal
    }
  }
})

watch(() => form.endDate, (newVal, oldVal) => {
  if (newVal !== oldVal && newVal !== '') {
    if (suppressDirtyFlagFromDurationUpdate) return
    form._dirtyEndDate = true
    const startIsNotGreyedOut = !(form.durationValue && form.durationFrom === 'end')
    if (!form._dirtyStartDate && !form.startDate && startIsNotGreyedOut) {
      form.startDate = newVal
    }
  }
})

  
  defineExpose({
    open: () => dialogRef.value?.showModal()
  })
  
  function handleEditBlockedField(blockedBy, event) {
    if ((blockedBy === 'end' && form.durationValue && form.durationFrom === 'end') ||
        (blockedBy === 'start' && form.durationValue && form.durationFrom === 'start')) {
      event.preventDefault()
      event.stopImmediatePropagation()
      //add confirmation logic later when not buggy
    //   const confirmed = confirm(`Editing this field will clear the duration. Continue?`)
    //   if (confirmed) {
    //     form.durationValue = null
    //   }
    }
  }
  
  function handleEditDurationField(event) {
    if (form.startDate && form.endDate) {
      event.preventDefault()
      event.stopImmediatePropagation()
      //add confirmation logic later when not buggy
    //   const confirmed = confirm('Editing duration will clear start and end dates. Continue?')
    //   if (confirmed) {
    //     form.startDate = ''
    //     form.endDate = ''
    //   }
    }
  }
  
  function convertToMinutes(value, unit) {
    const map = { minutes: 1, hours: 60, days: 1440, weeks: 10080 }
    return value * map[unit]
  }
  
  async function submitForm() {
  if (!isFormValid.value) {
    alert("You must either:\n• Enter both start and end date/time\nOR\n• Enter a start or end date and a valid duration.")
    return
  }

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
  
    const res = await fetch('/api/events', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    })
  
    if (res.ok) {
      emit('item-added')
      resetForm()
      dialogRef.value?.close()
    } else {
      console.error('Failed to submit')
    }
  }
  
  
  function clearDurationFields() {
    form.durationValue = null
    form.durationUnit = 'minutes'
    form.durationFrom = 'start'
  }
  
  </script>  