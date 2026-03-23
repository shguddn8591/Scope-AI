import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import Home from '@/app/page'

// Mock Recharts to avoid issues in JSDOM
jest.mock('recharts', () => {
  const OriginalModule = jest.requireActual('recharts')
  return {
    ...OriginalModule,
    ResponsiveContainer: ({ children }: any) => (
      <div style={{ width: '800px', height: '400px' }}>{children}</div>
    ),
  }
})

// Mock window.print
window.print = jest.fn()

describe('Scope-AI Home Page', () => {
  beforeEach(() => {
    localStorage.clear()
    jest.clearAllMocks()
    global.fetch = jest.fn() as jest.Mock
  })

  it('renders the main title and discovery panel', () => {
    render(<Home />)
    expect(screen.getByText('Scope-AI')).toBeInTheDocument()
    expect(screen.getByText('Project Discovery')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Describe your AI idea in detail...')).toBeInTheDocument()
  })

  it('updates the prompt when a template is clicked', () => {
    render(<Home />)
    const templateBadge = screen.getByText('SaaS Starter')
    fireEvent.click(templateBadge)
    
    const textarea = screen.getByPlaceholderText('Describe your AI idea in detail...') as HTMLTextAreaElement
    expect(textarea.value).toContain('B2B SaaS')
  })

  it('shows an error message when the backend is unreachable', async () => {
    (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Connection failed'))
    
    render(<Home />)
    const textarea = screen.getByPlaceholderText('Describe your AI idea in detail...')
    fireEvent.change(textarea, { target: { value: 'Test idea' } })
    
    const generateBtn = screen.getByText('Generate Blueprint')
    fireEvent.click(generateBtn)
    
    await waitFor(() => {
      expect(screen.getByText('Connection failed')).toBeInTheDocument()
    })
  })

  it('successfully displays results after analysis', async () => {
    const mockData = {
      projectName: "Test AI App",
      tasks: [
        { id: 1, name: "Task 1", description: "Desc 1", inputTokens: 1000, outputTokens: 500, complexity: "Low", cost: 0.1 }
      ],
      modelUsed: "gpt-4o-mini",
      totalEstimatedCost: 0.1,
      techStack: { frontend: "React", backend: "FastAPI", database: "PostgreSQL", infrastructure: "AWS" },
      systemPrompts: { architect: "...", techLead: "...", cfo: "..." },
      businessMetrics: { 
        revenueModel: "SaaS", targetPricing: 10, monthlyOperatingCost: 100, bepUsers: 10, margin: 0.5,
        valueProposition: "Test Value Prop", risks: ["Test Risk"]
      },
      roadmap: ["Phase 1", "Phase 2"],
      recommendations: [{ model: "Model A", reason: "Good" }]
    };

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockData,
    })

    render(<Home />)
    
    // Fill prompt
    const textarea = screen.getByPlaceholderText('Describe your AI idea in detail...')
    fireEvent.change(textarea, { target: { value: 'Test idea' } })
    
    // Click generate
    const generateBtn = screen.getByText('Generate Blueprint')
    fireEvent.click(generateBtn)
    
    // Check loading state
    expect(screen.getByText('Architecting...')).toBeInTheDocument()
    
    // Wait for results
    await waitFor(async () => {
      const titles = await screen.findAllByText('Test AI App')
      expect(titles.length).toBeGreaterThan(0)
      
      const costs = await screen.findAllByText('$0.1000', { exact: false })
      expect(costs.length).toBeGreaterThan(0)
    })
  })
})
