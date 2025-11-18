'use client'

interface Template {
  id: string
  name: string
  description: string
  duration: string
  places: number
  icon: string
}

interface TemplateSelectorProps {
  onSelect: (templateId: string) => void
}

const templates: Template[] = [
  {
    id: 'half_day',
    name: '오전 반나절',
    description: '3-4시간 가벼운 여행',
    duration: '3-4시간',
    places: 3,
    icon: '☕',
  },
  {
    id: 'full_day',
    name: '하루 코스',
    description: '알찬 하루 일정',
    duration: '8시간',
    places: 6,
    icon: '🌞',
  },
  {
    id: 'two_days',
    name: '이틀 코스',
    description: '여유로운 2일 여행',
    duration: '2일',
    places: 10,
    icon: '🏖️',
  },
]

export default function TemplateSelector({ onSelect }: TemplateSelectorProps) {
  return (
    <div className="mb-8">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">
        🚀 빠른 시작 - 템플릿 선택
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {templates.map((template) => (
          <button
            key={template.id}
            onClick={() => onSelect(template.id)}
            className="bg-white border-2 border-gray-200 hover:border-blue-500 rounded-lg p-6 text-left transition group"
          >
            <div className="text-4xl mb-3">{template.icon}</div>
            <h4 className="font-semibold text-gray-800 mb-2 group-hover:text-blue-600">
              {template.name}
            </h4>
            <p className="text-sm text-gray-600 mb-3">
              {template.description}
            </p>
            <div className="flex items-center gap-3 text-xs text-gray-500">
              <span>⏰ {template.duration}</span>
              <span>📍 약 {template.places}곳</span>
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}

