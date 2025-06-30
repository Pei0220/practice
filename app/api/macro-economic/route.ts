import { NextRequest, NextResponse } from 'next/server';
import { MacroEconomicService } from '@/lib/backend/services/macro-economic.service';

const macroService = new MacroEconomicService();

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'indicators';

    switch (type) {
      case 'indicators':
        const indicators = await macroService.getMajorEconomicIndicators();
        return NextResponse.json({
          success: true,
          data: indicators
        });

      case 'policies':
        const policies = await macroService.getCentralBankPolicies();
        return NextResponse.json({
          success: true,
          data: policies
        });

      case 'calendar':
        const days = parseInt(searchParams.get('days') || '7');
        const calendar = await macroService.getEconomicCalendar(days);
        return NextResponse.json({
          success: true,
          data: calendar
        });

      case 'report':
        const report = await macroService.generateMacroAnalysisReport();
        return NextResponse.json({
          success: true,
          data: report
        });

      default:
        return NextResponse.json({
          success: false,
          error: '不支援的總經數據類型'
        }, { status: 400 });
    }
  } catch (error) {
    console.error('Macro economic API error:', error);
    return NextResponse.json({
      success: false,
      error: '獲取總經數據失敗'
    }, { status: 500 });
  }
}
