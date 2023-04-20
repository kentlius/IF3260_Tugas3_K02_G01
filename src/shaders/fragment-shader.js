export const fragmentShaderSource = `
precision mediump float;

uniform vec3 u_reverseLightDirection;

uniform bool u_shadingOn;

uniform int u_textureMode;
varying vec2 v_textureCoord;

uniform vec3 u_worldCameraPosition;

varying vec3 v_modelPosition;
varying vec3 v_viewModelPosition;

varying vec3 v_worldNormal;

varying vec4 v_color;

uniform sampler2D u_texture_image;
uniform samplerCube u_texture_environment;
uniform sampler2D u_texture_bump;
uniform sampler2D u_texture_default;

varying mat3 v_tbn;

void main() {
   vec3 worldNormal = normalize(v_worldNormal);

   vec3 ambientLight = vec3(0.3, 0.3, 0.3);
   float directionalLight = dot(worldNormal, u_reverseLightDirection);
   vec3 light = ambientLight + directionalLight;

   gl_FragColor = v_color;

   if(u_textureMode == 0) {
      gl_FragColor = texture2D(u_texture_image, v_textureCoord);
   } else if(u_textureMode == 1) {
      vec3 eyeToSurfaceDir = normalize(v_modelPosition - u_worldCameraPosition);
      vec3 reflectionDir = reflect(eyeToSurfaceDir, worldNormal);

      gl_FragColor = textureCube(u_texture_environment, reflectionDir);
   } else if(u_textureMode == 2) {
      vec3 fragPos = v_tbn * v_viewModelPosition;
      vec3 lightPos = v_tbn * u_reverseLightDirection;

      vec3 lightDir = normalize(lightPos - fragPos);
      vec3 albedo = texture2D(u_texture_bump, v_textureCoord).rgb;
      vec3 ambient = 0.3 * albedo;
      vec3 norm = normalize(texture2D(u_texture_bump, v_textureCoord).rgb * 2.0 - 1.0);
      float diffuse = max(dot(lightDir, norm), 0.0);

      gl_FragColor = vec4(diffuse * albedo + ambient, 1.0);
   } else if(u_textureMode == 3) {
      // only use the texture color
      gl_FragColor = texture2D(u_texture_default, v_textureCoord);
   }

   if(u_shadingOn) {
      gl_FragColor.rgb *= light;
   }
}
`;
