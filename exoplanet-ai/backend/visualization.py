"""
Visualization module для создания графиков кривых блеска
"""

import numpy as np
import plotly.graph_objects as go
import plotly.express as px
from typing import Dict, List, Any, Optional
import logging

logger = logging.getLogger(__name__)

class LightcurveVisualizer:
    """
    Визуализатор для кривых блеска и результатов анализа
    """

    def __init__(self):
        self.colors = {
            'primary': '#3b82f6',
            'secondary': '#ef4444',
            'success': '#10b981',
            'warning': '#f59e0b',
            'background': '#1f2937',
            'text': '#ffffff'
        }

    def create_lightcurve_plot(self, times: List[float], fluxes: List[float],
                             title: str = "Light Curve",
                             show_transits: bool = False,
                             transits: Optional[List[int]] = None) -> Dict[str, Any]:
        """
        Создание графика кривой блеска

        Args:
            times: Времена наблюдений
            fluxes: Значения потока
            title: Заголовок графика
            show_transits: Показывать транзиты
            transits: Индексы транзитов

        Returns:
            Dict с данными графика
        """
        try:
            fig = go.Figure()

            # Основная кривая блеска
            fig.add_trace(go.Scatter(
                x=times,
                y=fluxes,
                mode='markers',
                name='Flux Data',
                marker=dict(
                    color=self.colors['primary'],
                    size=3,
                    opacity=0.7
                ),
                showlegend=True
            ))

            # Транзиты
            if show_transits and transits:
                transit_times = [times[i] for i in transits if i < len(times)]
                transit_fluxes = [fluxes[i] for i in transits if i < len(fluxes)]

                fig.add_trace(go.Scatter(
                    x=transit_times,
                    y=transit_fluxes,
                    mode='markers',
                    name='Detected Transits',
                    marker=dict(
                        color=self.colors['secondary'],
                        size=8,
                        symbol='x'
                    ),
                    showlegend=True
                ))

            # Настройки макета
            fig.update_layout(
                title=dict(
                    text=title,
                    font=dict(color=self.colors['text'], size=16)
                ),
                xaxis=dict(
                    title='Time (BJD)',
                    gridcolor='#374151',
                    linecolor='#6b7280',
                    tickfont=dict(color=self.colors['text'])
                ),
                yaxis=dict(
                    title='Normalized Flux',
                    gridcolor='#374151',
                    linecolor='#6b7280',
                    tickfont=dict(color=self.colors['text'])
                ),
                plot_bgcolor=self.colors['background'],
                paper_bgcolor=self.colors['background'],
                font=dict(color=self.colors['text']),
                showlegend=True,
                legend=dict(
                    bgcolor='rgba(0,0,0,0.5)',
                    bordercolor=self.colors['text'],
                    borderwidth=1
                )
            )

            return {
                'data': fig.data,
                'layout': fig.layout,
                'success': True
            }

        except Exception as e:
            logger.error(f"Error creating lightcurve plot: {e}")
            return self._create_error_plot(f"Error creating lightcurve plot: {str(e)}")

    def create_phase_folded_plot(self, times: List[float], fluxes: List[float],
                               period: float, title: str = "Phase-folded Light Curve") -> Dict[str, Any]:
        """
        Создание фазово-сложенного графика

        Args:
            times: Времена наблюдений
            fluxes: Значения потока
            period: Период для сложения
            title: Заголовок графика

        Returns:
            Dict с данными графика
        """
        try:
            # Вычисляем фазы
            phases = np.array([(t % period) / period for t in times])

            # Сортируем по фазе
            sort_idx = np.argsort(phases)
            sorted_phases = phases[sort_idx]
            sorted_fluxes = np.array(fluxes)[sort_idx]

            fig = go.Figure()

            fig.add_trace(go.Scatter(
                x=sorted_phases,
                y=sorted_fluxes,
                mode='markers',
                name='Phase-folded Data',
                marker=dict(
                    color=self.colors['primary'],
                    size=4,
                    opacity=0.7
                ),
                showlegend=True
            ))

            # Настройки макета
            fig.update_layout(
                title=dict(
                    text=f"{title} (P = {period:.3f} days)",
                    font=dict(color=self.colors['text'], size=16)
                ),
                xaxis=dict(
                    title='Phase',
                    gridcolor='#374151',
                    linecolor='#6b7280',
                    tickfont=dict(color=self.colors['text'])
                ),
                yaxis=dict(
                    title='Normalized Flux',
                    gridcolor='#374151',
                    linecolor='#6b7280',
                    tickfont=dict(color=self.colors['text'])
                ),
                plot_bgcolor=self.colors['background'],
                paper_bgcolor=self.colors['background'],
                font=dict(color=self.colors['text'])
            )

            return {
                'data': fig.data,
                'layout': fig.layout,
                'success': True
            }

        except Exception as e:
            logger.error(f"Error creating phase-folded plot: {e}")
            return self._create_error_plot(f"Error creating phase-folded plot: {str(e)}")

    def create_periodogram_plot(self, periods: List[float], powers: List[float],
                              title: str = "Periodogram") -> Dict[str, Any]:
        """
        Создание графика периодограммы

        Args:
            periods: Периоды
            powers: Мощности
            title: Заголовок графика

        Returns:
            Dict с данными графика
        """
        try:
            fig = go.Figure()

            fig.add_trace(go.Scatter(
                x=periods,
                y=powers,
                mode='lines',
                name='Power',
                line=dict(color=self.colors['success'], width=2),
                showlegend=True
            ))

            # Настройки макета
            fig.update_layout(
                title=dict(
                    text=title,
                    font=dict(color=self.colors['text'], size=16)
                ),
                xaxis=dict(
                    title='Period (days)',
                    gridcolor='#374151',
                    linecolor='#6b7280',
                    tickfont=dict(color=self.colors['text'])
                ),
                yaxis=dict(
                    title='Power',
                    gridcolor='#374151',
                    linecolor='#6b7280',
                    tickfont=dict(color=self.colors['text'])
                ),
                plot_bgcolor=self.colors['background'],
                paper_bgcolor=self.colors['background'],
                font=dict(color=self.colors['text'])
            )

            return {
                'data': fig.data,
                'layout': fig.layout,
                'success': True
            }

        except Exception as e:
            logger.error(f"Error creating periodogram plot: {e}")
            return self._create_error_plot(f"Error creating periodogram plot: {str(e)}")

    def _create_error_plot(self, error_message: str) -> Dict[str, Any]:
        """
        Создание графика ошибки

        Args:
            error_message: Сообщение об ошибке

        Returns:
            Dict с данными графика ошибки
        """
        fig = go.Figure()

        fig.add_annotation(
            text=f"Error: {error_message}",
            xref="paper", yref="paper",
            x=0.5, y=0.5, showarrow=False,
            font=dict(color=self.colors['secondary'], size=14)
        )

        fig.update_layout(
            title="Error",
            plot_bgcolor=self.colors['background'],
            paper_bgcolor=self.colors['background'],
            font=dict(color=self.colors['text']),
            xaxis=dict(showgrid=False, showticklabels=False),
            yaxis=dict(showgrid=False, showticklabels=False)
        )

        return {
            'data': fig.data,
            'layout': fig.layout,
            'success': False,
            'error': error_message
        }


def create_lightcurve_visualization(times: List[float], fluxes: List[float],
                                  analysis_results: Dict[str, Any],
                                  comparison_data: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
    """
    Создание полной визуализации для анализа

    Args:
        times: Времена наблюдений
        fluxes: Значения потока
        analysis_results: Результаты анализа
        comparison_data: Данные для сравнения

    Returns:
        Dict с графиками
    """
    visualizer = LightcurveVisualizer()
    plots = {}

    try:
        # Основная кривая блеска
        plots['main_lightcurve'] = visualizer.create_lightcurve_plot(
            times, fluxes,
            title="Light Curve Analysis",
            show_transits=True,
            transits=analysis_results.get('transits', [])
        )

        # Периодограмма если есть данные
        if 'period' in analysis_results:
            periods = np.linspace(0.5, 50, 1000).tolist()
            powers = np.random.random(1000).tolist()  # Placeholder
            plots['periodogram'] = visualizer.create_periodogram_plot(
                periods, powers,
                title=f"Periodogram (Detected Period: {analysis_results['period']:.3f} days)"
            )

        # Фазово-сложенная кривая
        if 'period' in analysis_results:
            plots['phase_folded'] = visualizer.create_phase_folded_plot(
                times, fluxes,
                analysis_results['period'],
                title="Phase-folded Light Curve"
            )

        return plots

    except Exception as e:
        logger.error(f"Error creating visualization: {e}")
        return {
            'error': visualizer._create_error_plot(f"Visualization error: {str(e)}")
        }
