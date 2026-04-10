
export const detectMoodFun = (mood) => {
    if (mood < 60) return ['relaxed' || 'sleepy']
    if (mood >= 60 && mood < 80) return ['calm' || 'chill']
    if (mood >= 80 && mood < 100) return ['focused' || 'studying' || 'alert']
    if (mood >= 100 && mood < 120) return ['hyped' || 'excited' || 'stressed']
  return ['anxious', 'stressed', 'over-stimulated']
}
