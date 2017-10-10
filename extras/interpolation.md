# Notes & Comparison of Spatial Interpolation Schemes for Pollution Concentration

> "...applications of kriging techniques to interpolate air pollutant levels have to be justified by the presence of spatial relationship captured by the empirical data. Forcing the data into a kriging framework without empirical evidence may commit model specification errors."
>
> "Overall, we believe that the air-monitoring network is poorly suited for estimating spatial autocorrelation of aggregated air pollution measurements. The monitors have historically been placed in locations where exceedences of air quality standards are expected, and therefore tend to be clustered in urban areas. Rural areas have relatively few monitors, and so the distribution of monitors is biased toward areas of higher pollution concentrations. To compute accurately the spatial statistics of air pollution distributions, more evenly distributed monitors are required. This will be an important issue to consider when we evaluate the linked NHANES-III and interpolated air concentration data, since almost half of the children live in more urbanized areas and half in more rural areas."
>
> [Comparison of spatial interpolation methods for the estimation of air quality data][1]

## Parameters

- Wind, O3, 


## Artificial Neural Networks

- 

[Spatial Interpolation Methodologies in Urban Air Pollution Modeling: Application for the Greater Area of Metropolitan Athens, Greece][2]


## Inverse distance weighting

- Seems to underpredict
- Cannot produce values beyond max/min


## Kriging (best linear biased estimater)

- Assumes spatial autocorrelation
- Less effective with sparse observation

- [Variogram1](http://faculty.washington.edu/edford/Variogram.pdf)
- [Variogram2](http://www.statios.com/Resources/04-variogram.pdf)


## Thin plate spline

- Estimation surface passes through samples
- Supposedly good for pollution concentration ([source][3])


## References

1. http://www.nature.com/jes/journal/v14/n5/full/7500338a.html
2. https://www.intechopen.com/books/advanced-air-pollution/spatial-interpolation-methodologies-in-urban-air-pollution-modeling-application-for-the-greater-area
3. http://www.gisresources.com/types-interpolation-methods_3/
4. https://gis.stackexchange.com/questions/83470/choosing-idw-vs-kriging-interpolation-for-dem-creation