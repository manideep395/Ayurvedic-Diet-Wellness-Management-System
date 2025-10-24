import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Clock, Utensils } from "lucide-react";

interface FoodItem {
  item: string;
  portion_size: string;
  ayurvedic_properties?: {
    rasa?: string;
    guna?: string;
    virya?: string;
    vipaka?: string;
    dosha_effect?: string;
  };
  nutritional_breakdown?: {
    calories?: string;
    protein?: string;
    carbohydrates?: string;
    fiber?: string;
    fat?: string;
  };
  preparation?: string;
}

interface Meal {
  meal_name?: string;
  timing?: string;
  food_items?: FoodItem[];
  notes?: string;
}

interface MealPlan {
  description?: string;
  introduction?: string;
  water_intake_recommendation?: string;
  meals?: Meal[];
  breakfast?: Meal;
  mid_morning_snack?: Meal;
  lunch?: Meal;
  evening_snack?: Meal;
  dinner?: Meal;
}

interface DietaryRecommendation {
  recommendationNumber?: number;
  title: string;
  description: string;
  foodsToInclude?: string[];
  foodsToAvoid?: string[];
  mealTiming?: string[];
  recommendedBeverages?: string[];
  beveragesToAvoid?: string[];
  ayurvedicPrinciples?: string;
  modernNutritionExplanation?: string;
}

interface RecommendationData {
  patient_name?: string;
  patientName?: string;
  age?: number;
  prakriti?: string;
  health_condition?: string;
  healthCondition?: string;
  health_conditions?: string[];
  meal_plan?: MealPlan;
  dietaryRecommendations?: DietaryRecommendation[];
}

interface MealPlanDisplayProps {
  data: string | RecommendationData;
}

export const MealPlanDisplay = ({ data }: MealPlanDisplayProps) => {
  let parsedData: RecommendationData;

  console.log('MealPlanDisplay received data:', data);
  console.log('Data type:', typeof data);

  try {
    if (typeof data === 'string') {
      console.log('Parsing string data...');
      // Remove markdown code blocks if present
      let cleanData = data.trim();
      
      // Check for JSON code blocks
      const jsonMatch = cleanData.match(/```json\s*([\s\S]*?)\s*```/);
      if (jsonMatch) {
        cleanData = jsonMatch[1].trim();
      }
      
      // Check for plain code blocks
      const codeMatch = cleanData.match(/```\s*([\s\S]*?)\s*```/);
      if (codeMatch && !jsonMatch) {
        cleanData = codeMatch[1].trim();
      }
      
      console.log('Cleaned data to parse:', cleanData.substring(0, 200) + '...');
      
      try {
        parsedData = JSON.parse(cleanData);
      } catch (parseError) {
        // If JSON parsing fails, try to find JSON-like content
        const jsonStart = cleanData.indexOf('{');
        const jsonEnd = cleanData.lastIndexOf('}');
        if (jsonStart !== -1 && jsonEnd !== -1 && jsonEnd > jsonStart) {
          const jsonContent = cleanData.substring(jsonStart, jsonEnd + 1);
          parsedData = JSON.parse(jsonContent);
        } else {
          throw parseError;
        }
      }
    } else {
      console.log('Using data as object');
      parsedData = data;
    }
    console.log('Successfully parsed data:', parsedData);
  } catch (error) {
    console.error("Failed to parse recommendation:", error);
    console.error("Raw data:", typeof data === 'string' ? data.substring(0, 500) : data);
    return (
      <Card className="border-destructive">
        <CardContent className="pt-6">
          <div className="space-y-2">
            <p className="text-destructive font-semibold">Failed to parse recommendation data</p>
            <p className="text-sm text-muted-foreground">The AI response may be incomplete or malformed. Please try generating again.</p>
            <details className="text-xs">
              <summary className="cursor-pointer hover:text-foreground transition-colors">Show error details</summary>
              <pre className="mt-2 p-2 bg-muted rounded overflow-auto max-h-40 text-[10px]">
                {error instanceof Error ? error.message : String(error)}
                {'\n\nPreview of raw data:\n'}
                {typeof data === 'string' ? data.substring(0, 300) : JSON.stringify(data, null, 2).substring(0, 300)}
              </pre>
            </details>
          </div>
        </CardContent>
      </Card>
    );
  }

  const mealPlan = parsedData.meal_plan;
  // Handle both snake_case and camelCase from AI
  const dietaryRecommendations = (parsedData as any).dietary_recommendations || parsedData.dietaryRecommendations;
  
  // Handle both naming conventions
  const patientName = parsedData.patient_name || parsedData.patientName;
  const healthCondition = parsedData.health_condition || parsedData.healthCondition;
  
  // Handle health_conditions - can be array or string from AI
  const healthConditions = parsedData.health_conditions;
  const healthConditionsDisplay = healthConditions 
    ? (Array.isArray(healthConditions) ? healthConditions.join(", ") : String(healthConditions))
    : healthCondition;
  
  // Normalize dietary recommendations to handle both snake_case and camelCase
  const normalizedRecommendations = dietaryRecommendations?.map((rec: any) => ({
    recommendationNumber: rec.recommendation_number || rec.recommendationNumber,
    title: rec.title,
    description: rec.description,
    foodsToInclude: rec.foods_to_include || rec.foodsToInclude,
    foodsToAvoid: rec.foods_to_avoid || rec.foodsToAvoid,
    mealTiming: rec.meal_timing || rec.mealTiming,
    recommendedBeverages: rec.recommended_beverages || rec.recommendedBeverages,
    beveragesToAvoid: rec.beverages_to_avoid || rec.beveragesToAvoid,
    ayurvedicPrinciples: rec.ayurvedic_principles || rec.ayurvedicPrinciples,
    modernNutritionExplanation: rec.modern_nutrition_explanation || rec.modernNutritionExplanation,
  }));
  
  console.log('Meal plan:', mealPlan);
  console.log('Dietary recommendations:', dietaryRecommendations);
  
  if (!mealPlan && !dietaryRecommendations) {
    return (
      <Card className="border-orange-500/50">
        <CardContent className="pt-6">
          <p className="text-orange-600 dark:text-orange-400 font-semibold mb-2">No structured data found</p>
          <p className="text-sm text-muted-foreground mb-4">The AI generated a response but it's not in the expected format.</p>
          <details className="text-xs">
            <summary className="cursor-pointer hover:text-foreground transition-colors">Show raw response</summary>
            <pre className="mt-2 p-2 bg-muted rounded overflow-auto max-h-60 text-[10px]">
              {JSON.stringify(parsedData, null, 2)}
            </pre>
          </details>
        </CardContent>
      </Card>
    );
  }

  const mealSections = [
    { key: 'breakfast', title: 'Breakfast', icon: '🌅' },
    { key: 'mid_morning_snack', title: 'Mid-Morning Snack', icon: '☕' },
    { key: 'lunch', title: 'Lunch', icon: '🌞' },
    { key: 'evening_snack', title: 'Evening Snack', icon: '🍵' },
    { key: 'dinner', title: 'Dinner', icon: '🌙' },
  ];

  // Check if we have meals array (new format) instead of individual meal properties
  const mealsArray = mealPlan?.meals;
  const hasIntroduction = mealPlan?.introduction;
  const waterIntakeRec = mealPlan?.water_intake_recommendation;

  return (
    <div className="space-y-6">
      {/* Patient Info Header */}
      <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-accent/5">
        <CardContent className="pt-6">
          <div className="flex flex-wrap gap-4 items-center">
            <div>
              <p className="text-sm text-muted-foreground">Patient</p>
              <p className="text-lg font-semibold">{patientName?.replace('_', ' ')}</p>
            </div>
            {parsedData.age && (
              <>
                <Separator orientation="vertical" className="h-10" />
                <div>
                  <p className="text-sm text-muted-foreground">Age</p>
                  <p className="text-lg font-semibold">{parsedData.age} years</p>
                </div>
              </>
            )}
            {parsedData.prakriti && (
              <>
                <Separator orientation="vertical" className="h-10" />
                <div>
                  <p className="text-sm text-muted-foreground">Prakriti</p>
                  <Badge variant="secondary" className="mt-1 text-base">
                    {parsedData.prakriti.toUpperCase()}
                  </Badge>
                </div>
              </>
            )}
            {healthConditionsDisplay && (
              <>
                <Separator orientation="vertical" className="h-10" />
                <div>
                  <p className="text-sm text-muted-foreground">Conditions</p>
                  <p className="text-lg font-semibold">
                    {healthConditionsDisplay}
                  </p>
                </div>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Dietary Recommendations */}
      {normalizedRecommendations && normalizedRecommendations.length > 0 && (
        <div className="space-y-4">
          {normalizedRecommendations.map((rec, idx) => (
            <Card key={idx} className="border-primary/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <span className="bg-primary text-primary-foreground rounded-full w-8 h-8 flex items-center justify-center text-sm">
                    {rec.recommendationNumber || idx + 1}
                  </span>
                  {rec.title}
                </CardTitle>
                <CardDescription>{rec.description}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {rec.foodsToInclude && rec.foodsToInclude.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-sm mb-2 text-green-600 dark:text-green-400">✓ Foods to Include</h4>
                    <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                      {rec.foodsToInclude.map((food, i) => (
                        <li key={i}>{food}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {rec.foodsToAvoid && rec.foodsToAvoid.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-sm mb-2 text-red-600 dark:text-red-400">✗ Foods to Avoid</h4>
                    <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                      {rec.foodsToAvoid.map((food, i) => (
                        <li key={i}>{food}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {rec.mealTiming && rec.mealTiming.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-sm mb-2">Meal Timing</h4>
                    <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                      {rec.mealTiming.map((time, i) => (
                        <li key={i}>{time}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {rec.recommendedBeverages && rec.recommendedBeverages.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-sm mb-2 text-blue-600 dark:text-blue-400">Recommended Beverages</h4>
                    <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                      {rec.recommendedBeverages.map((bev, i) => (
                        <li key={i}>{bev}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {rec.ayurvedicPrinciples && (
                  <div className="bg-primary/10 border border-primary/20 rounded-lg p-3">
                    <p className="text-xs font-semibold uppercase mb-1">Ayurvedic Principles</p>
                    <p className="text-sm">{rec.ayurvedicPrinciples}</p>
                  </div>
                )}
                {rec.modernNutritionExplanation && (
                  <div className="bg-accent/20 border border-accent/30 rounded-lg p-3">
                    <p className="text-xs font-semibold uppercase mb-1">Modern Nutrition</p>
                    <p className="text-sm text-muted-foreground">{rec.modernNutritionExplanation}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Meal Plan Introduction */}
      {hasIntroduction && (
        <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-accent/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Utensils className="h-5 w-5 text-primary" />
              Meal Plan Overview
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground leading-relaxed">{hasIntroduction}</p>
            {waterIntakeRec && (
              <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
                <p className="text-sm font-semibold text-blue-700 dark:text-blue-300 mb-1">
                  💧 Water Intake Recommendation
                </p>
                <p className="text-sm text-muted-foreground">{waterIntakeRec}</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Legacy description support */}
      {mealPlan?.description && !hasIntroduction && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Utensils className="h-5 w-5 text-primary" />
              Meal Plan Overview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground leading-relaxed">{mealPlan.description}</p>
          </CardContent>
        </Card>
      )}

      {/* Meals - New Format (array) */}
      {mealsArray && mealsArray.map((meal, mealIdx) => {
        const getMealIcon = (mealName: string) => {
          const name = mealName.toLowerCase();
          if (name.includes('breakfast')) return '🌅';
          if (name.includes('mid') || name.includes('morning')) return '☕';
          if (name.includes('lunch')) return '🌞';
          if (name.includes('evening') || name.includes('snack')) return '🍵';
          if (name.includes('dinner')) return '🌙';
          return '🍽️';
        };

        return (
          <Card key={mealIdx} className="overflow-hidden border-border/50 hover:border-primary/30 transition-colors">
            <CardHeader className="bg-gradient-to-r from-muted/30 to-muted/50">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <span className="text-2xl">{getMealIcon(meal.meal_name || '')}</span>
                  {meal.meal_name}
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              {meal.food_items?.map((item, idx) => (
                <div key={idx} className="space-y-3">
                  {idx > 0 && <Separator />}
                  <div>
                    <div className="flex items-start justify-between gap-4 mb-2">
                      <h4 className="font-semibold text-lg">{item.item}</h4>
                      <Badge variant="secondary">{item.portion_size}</Badge>
                    </div>

                    {item.preparation && (
                      <p className="text-sm text-muted-foreground mb-3">
                        <span className="font-medium">Preparation:</span> {item.preparation}
                      </p>
                    )}

                    <div className="grid md:grid-cols-2 gap-4 mt-3">
                      {/* Nutritional Info */}
                      {item.nutritional_breakdown && (
                        <div className="bg-accent/20 border border-accent/30 rounded-lg p-3 space-y-1">
                          <p className="text-xs font-semibold text-foreground uppercase mb-2">
                            Nutritional Breakdown
                          </p>
                          <div className="grid grid-cols-2 gap-2 text-sm">
                            {item.nutritional_breakdown.calories && (
                              <div>
                                <span className="text-muted-foreground">Calories:</span>
                                <span className="ml-2 font-medium">{item.nutritional_breakdown.calories}</span>
                              </div>
                            )}
                            {item.nutritional_breakdown.protein && (
                              <div>
                                <span className="text-muted-foreground">Protein:</span>
                                <span className="ml-2 font-medium">{item.nutritional_breakdown.protein}</span>
                              </div>
                            )}
                            {item.nutritional_breakdown.carbohydrates && (
                              <div>
                                <span className="text-muted-foreground">Carbs:</span>
                                <span className="ml-2 font-medium">{item.nutritional_breakdown.carbohydrates}</span>
                              </div>
                            )}
                            {item.nutritional_breakdown.fiber && (
                              <div>
                                <span className="text-muted-foreground">Fiber:</span>
                                <span className="ml-2 font-medium">{item.nutritional_breakdown.fiber}</span>
                              </div>
                            )}
                            {item.nutritional_breakdown.fat && (
                              <div>
                                <span className="text-muted-foreground">Fat:</span>
                                <span className="ml-2 font-medium">{item.nutritional_breakdown.fat}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Ayurvedic Properties */}
                      {item.ayurvedic_properties && (
                        <div className="bg-primary/10 border border-primary/20 rounded-lg p-3 space-y-1">
                          <p className="text-xs font-semibold text-foreground uppercase mb-2">
                            Ayurvedic Properties
                          </p>
                          <div className="space-y-1 text-sm">
                            {item.ayurvedic_properties.rasa && (
                              <div>
                                <span className="text-muted-foreground">Rasa:</span>
                                <span className="ml-2 font-medium">{item.ayurvedic_properties.rasa}</span>
                              </div>
                            )}
                            {item.ayurvedic_properties.virya && (
                              <div>
                                <span className="text-muted-foreground">Virya:</span>
                                <span className="ml-2 font-medium">{item.ayurvedic_properties.virya}</span>
                              </div>
                            )}
                            {item.ayurvedic_properties.vipaka && (
                              <div>
                                <span className="text-muted-foreground">Vipaka:</span>
                                <span className="ml-2 font-medium">{item.ayurvedic_properties.vipaka}</span>
                              </div>
                            )}
                            {item.ayurvedic_properties.dosha_effect && (
                              <div>
                                <span className="text-muted-foreground">Dosha Effect:</span>
                                <span className="ml-2 font-medium text-xs">
                                  {item.ayurvedic_properties.dosha_effect}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}

              {meal.notes && (
                <div className="mt-4 p-3 bg-muted/50 rounded-lg border-l-4 border-primary">
                  <p className="text-sm text-muted-foreground italic">
                    <span className="font-semibold not-italic">Note:</span> {meal.notes}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        );
      })}

      {/* Meals - Legacy Format (individual properties) */}
      {!mealsArray && mealPlan && mealSections.map(({ key, title, icon }) => {
        const meal = mealPlan[key as keyof MealPlan] as Meal | undefined;
        if (!meal) return null;

        return (
          <Card key={key} className="overflow-hidden border-border/50 hover:border-primary/30 transition-colors">
            <CardHeader className="bg-gradient-to-r from-muted/30 to-muted/50">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <span className="text-2xl">{icon}</span>
                  {title}
                </CardTitle>
                {meal.timing && (
                  <Badge variant="outline" className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {meal.timing}
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              {meal.food_items?.map((item, idx) => (
                <div key={idx} className="space-y-3">
                  {idx > 0 && <Separator />}
                  <div>
                    <div className="flex items-start justify-between gap-4 mb-2">
                      <h4 className="font-semibold text-lg">{item.item}</h4>
                      <Badge variant="secondary">{item.portion_size}</Badge>
                    </div>

                    {item.preparation && (
                      <p className="text-sm text-muted-foreground mb-3">
                        <span className="font-medium">Preparation:</span> {item.preparation}
                      </p>
                    )}

                    <div className="grid md:grid-cols-2 gap-4 mt-3">
                      {/* Nutritional Info */}
                      {item.nutritional_breakdown && (
                        <div className="bg-accent/20 border border-accent/30 rounded-lg p-3 space-y-1">
                          <p className="text-xs font-semibold text-foreground uppercase mb-2">
                            Nutritional Breakdown
                          </p>
                          <div className="grid grid-cols-2 gap-2 text-sm">
                            {item.nutritional_breakdown.calories && (
                              <div>
                                <span className="text-muted-foreground">Calories:</span>
                                <span className="ml-2 font-medium">{item.nutritional_breakdown.calories}</span>
                              </div>
                            )}
                            {item.nutritional_breakdown.protein && (
                              <div>
                                <span className="text-muted-foreground">Protein:</span>
                                <span className="ml-2 font-medium">{item.nutritional_breakdown.protein}</span>
                              </div>
                            )}
                            {item.nutritional_breakdown.carbohydrates && (
                              <div>
                                <span className="text-muted-foreground">Carbs:</span>
                                <span className="ml-2 font-medium">{item.nutritional_breakdown.carbohydrates}</span>
                              </div>
                            )}
                            {item.nutritional_breakdown.fiber && (
                              <div>
                                <span className="text-muted-foreground">Fiber:</span>
                                <span className="ml-2 font-medium">{item.nutritional_breakdown.fiber}</span>
                              </div>
                            )}
                            {item.nutritional_breakdown.fat && (
                              <div>
                                <span className="text-muted-foreground">Fat:</span>
                                <span className="ml-2 font-medium">{item.nutritional_breakdown.fat}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Ayurvedic Properties */}
                      {item.ayurvedic_properties && (
                        <div className="bg-primary/10 border border-primary/20 rounded-lg p-3 space-y-1">
                          <p className="text-xs font-semibold text-foreground uppercase mb-2">
                            Ayurvedic Properties
                          </p>
                          <div className="space-y-1 text-sm">
                            {item.ayurvedic_properties.rasa && (
                              <div>
                                <span className="text-muted-foreground">Rasa:</span>
                                <span className="ml-2 font-medium">{item.ayurvedic_properties.rasa}</span>
                              </div>
                            )}
                            {item.ayurvedic_properties.virya && (
                              <div>
                                <span className="text-muted-foreground">Virya:</span>
                                <span className="ml-2 font-medium">{item.ayurvedic_properties.virya}</span>
                              </div>
                            )}
                            {item.ayurvedic_properties.dosha_effect && (
                              <div>
                                <span className="text-muted-foreground">Dosha:</span>
                                <span className="ml-2 font-medium text-xs">
                                  {item.ayurvedic_properties.dosha_effect}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}

              {meal.notes && (
                <div className="mt-4 p-3 bg-muted/50 rounded-lg">
                  <p className="text-sm text-muted-foreground italic">
                    <span className="font-semibold not-italic">Note:</span> {meal.notes}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};
